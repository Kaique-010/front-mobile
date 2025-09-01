from django.shortcuts import render
from .models import Controlevisita, Etapavisita, ItensVisita
from .serializers import ControleVisitaSerializer, EtapaVisitaSerializer, ExportarVisitaParaOrcamentoSerializer, ItensVisitaSerializer
from rest_framework import viewsets, status
from core.utils import get_licenca_db_config
from core.decorator import ModuloRequeridoMixin
from rest_framework.permissions import IsAuthenticated
from rest_framework.filters import SearchFilter, OrderingFilter
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.exceptions import NotFound
from rest_framework.response import Response
from rest_framework.decorators import action
from django.db.models import Q, Count, Avg
from datetime import datetime, date, timedelta
import logging

logger = logging.getLogger(__name__)


class ControleVisitaViewSet(ModuloRequeridoMixin, viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]
    modulo_requerido = 'Pedidos'
    serializer_class = ControleVisitaSerializer
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = [
        'ctrl_empresa', 
        'ctrl_filial', 
        'ctrl_numero',
        'ctrl_cliente', 
        'ctrl_data',
        'ctrl_vendedor',
        'ctrl_etapa'
    ]
    search_fields = [
        'ctrl_numero',
        'ctrl_cliente__enti_nome', 
        'ctrl_vendedor__enti_nome',
        'ctrl_contato',
        'ctrl_obse'
    ]
    ordering_fields = ['ctrl_data', 'ctrl_numero', 'ctrl_cliente']
    ordering = ['-ctrl_data', 'ctrl_numero']
    lookup_field = 'ctrl_id'

    def get_queryset(self, slug=None):

        banco = get_licenca_db_config(self.request)
        if not banco:
            logger.error("Banco de dados não encontrado.")
            raise NotFound("Banco de dados não encontrado.")
        
        empresa_id = self.request.headers.get("X-Empresa")
        filial_id = self.request.headers.get("X-Filial")
        
        # Base queryset com select_related para otimização
        queryset = Controlevisita.objects.using(banco).select_related(
            'ctrl_cliente',
            'ctrl_vendedor', 
            'ctrl_empresa'
        ).all()

        
        # Filtros por headers
        if empresa_id:
            queryset = queryset.filter(ctrl_empresa=empresa_id)
        if filial_id:
            queryset = queryset.filter(ctrl_filial=filial_id)
        
        # Filtros por query params
        cliente_nome = self.request.query_params.get('cliente_nome')
        vendedor_nome = self.request.query_params.get('vendedor_nome')
        data_inicio = self.request.query_params.get('data_inicio')
        data_fim = self.request.query_params.get('data_fim')
        etapa = self.request.query_params.get('etapa')
        
        if cliente_nome:
            queryset = queryset.filter(
                ctrl_cliente__enti_nome__icontains=cliente_nome
            )
        if vendedor_nome:
            queryset = queryset.filter(
                ctrl_vendedor__enti_nome__icontains=vendedor_nome
            )
        if data_inicio:
            queryset = queryset.filter(ctrl_data__gte=data_inicio)
        if data_fim:
            queryset = queryset.filter(ctrl_data__lte=data_fim)
        if etapa:
            queryset = queryset.filter(ctrl_etapa=etapa)
        
        return queryset.order_by('-ctrl_data', 'ctrl_numero')


    def get_serializer_context(self):
        context = super().get_serializer_context()
        context['banco'] = get_licenca_db_config(self.request)
        return context

    def destroy(self, request, *args, **kwargs):
        banco = get_licenca_db_config(self.request)
        visita = self.get_object()
        
        try:
            visita.delete()
            logger.info(f"🗑️ Exclusão da visita ID {visita.ctrl_id} concluída")
            return Response(status=status.HTTP_204_NO_CONTENT)
        except Exception as e:
            logger.error(f"Erro ao excluir visita: {e}")
            return Response(
                {"detail": "Erro ao excluir visita."},
                status=status.HTTP_400_BAD_REQUEST
            )

    @action(detail=False, methods=['get'], url_path='estatisticas')
    def estatisticas(self, request, slug=None):
        """
        Endpoint para retornar estatísticas pré-calculadas das visitas
        """
        try:
            banco = get_licenca_db_config(request)
            if not banco:
                logger.error("Banco de dados não encontrado.")
                raise NotFound("Banco de dados não encontrado.")
            
            empresa_id = request.headers.get("X-Empresa")
            filial_id = request.headers.get("X-Filial")
            
            # Base queryset
            queryset = Controlevisita.objects.using(banco)
            
            # Aplicar filtros de empresa e filial
            if empresa_id:
                queryset = queryset.filter(ctrl_empresa=empresa_id)
            if filial_id:
                queryset = queryset.filter(ctrl_filial=filial_id)
            
            # Data atual para cálculos
            hoje = date.today()
            inicio_mes = hoje.replace(day=1)
            inicio_ano = hoje.replace(month=1, day=1)
            
            # Estatísticas gerais
            total_visitas = queryset.count()
            visitas_mes_atual = queryset.filter(ctrl_data__gte=inicio_mes).count()
            visitas_ano_atual = queryset.filter(ctrl_data__gte=inicio_ano).count()
            
            # Estatísticas por etapa
            # Na linha 142, substituir:
            # for etapa_id, etapa_nome in Controlevisita.ETAPA_CHOICES:
            
            # Por:
            etapas_stats = {}
            etapas = Etapavisita.objects.using(banco).all()
            if empresa_id:
                etapas = etapas.filter(etap_empr=empresa_id)
            
            for etapa in etapas:
                count = queryset.filter(ctrl_etapa=etapa.etap_id).count()
                etapas_stats[etapa.etap_descricao] = count
            
            # Visitas por vendedor (top 5)
            vendedores_stats = list(
                queryset.select_related('ctrl_vendedor')
                .values('ctrl_vendedor__enti_nome')
                .annotate(total=Count('ctrl_id'))
                .order_by('-total')[:5]
            )
            
            # Média de KM percorrido
            visitas_com_km = queryset.exclude(
                Q(ctrl_km_inic__isnull=True) | Q(ctrl_km_fina__isnull=True)
            )
            
            km_total = 0
            km_count = 0
            for visita in visitas_com_km:
                if visita.ctrl_km_inic and visita.ctrl_km_fina:
                    km_total += float(visita.ctrl_km_fina - visita.ctrl_km_inic)
                    km_count += 1
            
            km_medio = round(km_total / km_count, 2) if km_count > 0 else 0
            
            # Visitas dos últimos 7 dias
            sete_dias_atras = hoje - timedelta(days=7)
            visitas_ultimos_7_dias = queryset.filter(ctrl_data__gte=sete_dias_atras).count()
            
            # Próximas visitas agendadas
            proximas_visitas_count = queryset.filter(
                ctrl_prox_visi__gte=hoje
            ).count()
            
            estatisticas = {
                'total_visitas': total_visitas,
                'visitas_mes_atual': visitas_mes_atual,
                'visitas_ano_atual': visitas_ano_atual,
                'visitas_ultimos_7_dias': visitas_ultimos_7_dias,
                'proximas_visitas_agendadas': proximas_visitas_count,
                'km_medio_por_visita': km_medio,
                'etapas': etapas_stats,
                'top_vendedores': [
                    {
                        'vendedor': item['ctrl_vendedor__enti_nome'] or 'Sem vendedor',
                        'total_visitas': item['total']
                    }
                    for item in vendedores_stats
                ],
                'data_atualizacao': hoje.isoformat()
            }
            
            logger.info(f"📊 Estatísticas calculadas: {total_visitas} visitas processadas")
            return Response(estatisticas)
            
        except Exception as e:
            logger.error(f"Erro ao calcular estatísticas: {e}")
            return Response(
                {"detail": "Erro ao calcular estatísticas."},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    @action(detail=False, methods=['get'], url_path='proximas')
    def proximas_visitas(self, request, slug=None):
        """
        Endpoint para retornar lista das próximas visitas agendadas
        """
        try:
            banco = get_licenca_db_config(request)
            if not banco:
                logger.error("Banco de dados não encontrado.")
                raise NotFound("Banco de dados não encontrado.")
            
            empresa_id = request.headers.get("X-Empresa")
            filial_id = request.headers.get("X-Filial")
            
            # Data atual
            hoje = date.today()
            
            # Filtrar próximas visitas
            queryset = Controlevisita.objects.using(banco).select_related(
                'ctrl_cliente',
                'ctrl_vendedor',
                'ctrl_empresa'
            ).filter(
                ctrl_prox_visi__gte=hoje
            )
            
            # Aplicar filtros de empresa e filial
            if empresa_id:
                queryset = queryset.filter(ctrl_empresa=empresa_id)
            if filial_id:
                queryset = queryset.filter(ctrl_filial=filial_id)
            
            # Ordenar por data da próxima visita
            queryset = queryset.order_by('ctrl_prox_visi')
            
            # Limitar a 50 próximas visitas para performance
            limit = int(request.query_params.get('limit', 1000))
            queryset = queryset[:limit]
            
            # Serializar os dados
            proximas_visitas = []
            for visita in queryset:
                dias_restantes = (visita.ctrl_prox_visi - hoje).days
                
                proxima_visita = {
                    'ctrl_id': visita.ctrl_id,
                    'ctrl_numero': visita.ctrl_numero,
                    'ctrl_data_original': visita.ctrl_data.isoformat() if visita.ctrl_data else None,
                    'ctrl_prox_visi': visita.ctrl_prox_visi.isoformat(),
                    'dias_restantes': dias_restantes,
                    'cliente': {
                        'id': visita.ctrl_cliente.enti_clie if visita.ctrl_cliente else None,
                        'nome': visita.ctrl_cliente.enti_nome if visita.ctrl_cliente else 'Cliente não informado'
                    },
                    'vendedor': {
                        'id': visita.ctrl_vendedor.enti_clie if visita.ctrl_vendedor else None,
                        'nome': visita.ctrl_vendedor.enti_nome if visita.ctrl_vendedor else 'Vendedor não informado'
                    },
                    'etapa': {
                        'id': visita.ctrl_etapa.etap_id if visita.ctrl_etapa else None,
                        'nome': visita.ctrl_etapa.etap_descricao if visita.ctrl_etapa else 'Não informado'
                    },
                    'contato': visita.ctrl_contato,
                    'telefone': visita.ctrl_fone,
                    'observacoes': visita.ctrl_obse,
                    'urgencia': 'alta' if dias_restantes <= 3 else 'media' if dias_restantes <= 7 else 'baixa'
                }
                proximas_visitas.append(proxima_visita)
            
            resultado = {
                'total': len(proximas_visitas),
                'proximas_visitas': proximas_visitas,
                'data_consulta': hoje.isoformat()
            }
            
            logger.info(f"📅 Próximas visitas consultadas: {len(proximas_visitas)} encontradas")
            return Response(resultado)
            
        except Exception as e:
            logger.error(f"Erro ao buscar próximas visitas: {e}")
            return Response(
                {"detail": "Erro ao buscar próximas visitas."},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

class ItensVisitaViewSet(ModuloRequeridoMixin, viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]

    serializer_class = ItensVisitaSerializer
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['item_visita', 'item_empr', 'item_fili']
    search_fields = ['item_prod', 'item_desc_prod']
    ordering = ['item_data']
    
    def get_queryset(self):
        banco = get_licenca_db_config(self.request)
        if not banco:
            raise NotFound("Banco de dados não encontrado.")
        
        empresa_id = self.request.headers.get("X-Empresa")
        filial_id = self.request.headers.get("X-Filial")
        
        queryset = ItensVisita.objects.using(banco).select_related('item_visita')
        
        if empresa_id:
            queryset = queryset.filter(item_empr=empresa_id)
        if filial_id:
            queryset = queryset.filter(item_fili=filial_id)
            
        return queryset
    
    def get_serializer_context(self):
        context = super().get_serializer_context()
        context['banco'] = get_licenca_db_config(self.request)
        return context

    @action(detail=False, methods=['post'], url_path='exportar-para-orcamento')
    def exportar_para_orcamento(self, request):
        """Exporta itens de uma visita para um novo orçamento"""
        try:
            banco = get_licenca_db_config(request)
            serializer = ExportarVisitaParaOrcamentoSerializer(data=request.data, context={'banco': banco})
            
            if not serializer.is_valid():
                return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
            
            visita_id = serializer.validated_data['visita_id']
            observacoes = serializer.validated_data.get('observacoes_orcamento', '')
            
            # Buscar visita e itens
            visita = Controlevisita.objects.using(banco).get(ctrl_id=visita_id)
            itens_visita = ItensVisita.objects.using(banco).filter(item_visita=visita)
            
            if not itens_visita.exists():
                return Response(
                    {'detail': 'Nenhum item encontrado para esta visita'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Criar orçamento
            max_numero = Orcamentos.objects.using(banco).filter(
                pedi_empr=visita.ctrl_empresa,
                pedi_fili=visita.ctrl_filial
            ).aggregate(Max('pedi_nume'))['pedi_nume__max'] or 0
            
            total_orcamento = sum(item.item_tota or 0 for item in itens_visita)
            
            orcamento = Orcamentos.objects.using(banco).create(
                pedi_empr=visita.ctrl_empresa,
                pedi_fili=visita.ctrl_filial,
                pedi_nume=max_numero + 1,
                pedi_forn=visita.ctrl_cliente.enti_clie if visita.ctrl_cliente else '',
                pedi_data=visita.ctrl_data,
                pedi_tota=total_orcamento,
                pedi_vend=visita.ctrl_vendedor.enti_clie if visita.ctrl_vendedor else '',
                pedi_obse=f"Orçamento gerado da visita {visita.ctrl_numero}. {observacoes}".strip()
            )
            
            # Criar itens do orçamento
            for idx, item_visita in enumerate(itens_visita, 1):
                ItensOrcamento.objects.using(banco).create(
                    iped_empr=visita.ctrl_empresa,
                    iped_fili=visita.ctrl_filial,
                    iped_pedi=str(orcamento.pedi_nume),
                    iped_item=idx,
                    iped_prod=item_visita.item_prod,
                    iped_quan=item_visita.item_quan,
                    iped_unit=item_visita.item_unit,
                    iped_tota=item_visita.item_tota,
                    iped_desc=item_visita.item_desc,
                    iped_data=visita.ctrl_data
                )
            
            # Atualizar visita com número do orçamento
            visita.ctrl_nume_orca = orcamento.pedi_nume
            visita.save()
            
            return Response({
                'detail': 'Orçamento criado com sucesso',
                'orcamento_numero': orcamento.pedi_nume,
                'total_itens': itens_visita.count(),
                'valor_total': total_orcamento
            }, status=status.HTTP_201_CREATED)
            
        except Exception as e:
            logger.error(f"Erro ao exportar visita para orçamento: {e}")
            return Response(
                {'detail': 'Erro interno do servidor'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class EtapaVisitaViewSet(ModuloRequeridoMixin, viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]
 
    serializer_class = EtapaVisitaSerializer
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['etap_empr', 'etap_nume']
    search_fields = ['etap_descricao', 'etap_obse']
    ordering_fields = ['etap_nume', 'etap_descricao']
    ordering = ['etap_nume']
    lookup_field = 'etap_id'
    
    def get_queryset(self):
        banco = get_licenca_db_config(self.request)
        if not banco:
            logger.error("Banco de dados não encontrado.")
            raise NotFound("Banco de dados não encontrado.")
        
        empresa_id = self.request.headers.get("X-Empresa")
        
        queryset = Etapavisita.objects.using(banco).select_related('etap_empr').all()
        
        if empresa_id:
            queryset = queryset.filter(etap_empr=empresa_id)
        
        return queryset.order_by('etap_nume')
    
    def get_serializer_context(self):
        context = super().get_serializer_context()
        context['banco'] = get_licenca_db_config(self.request)
        return context



        


    
    
