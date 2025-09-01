from rest_framework import serializers
from rest_framework import status
from django.db.models import Max
from .models import Controlevisita, Etapavisita, ItensVisita
from Produtos.models import Produtos
from Entidades.models import Entidades
from Licencas.models import Empresas
from Orcamentos.models import Orcamentos, ItensOrcamento
from core.utils import get_licenca_db_config
from rest_framework.exceptions import NotFound
import logging

logger = logging.getLogger(__name__)


class ControleVisitaSerializer(serializers.ModelSerializer):
    cliente_nome = serializers.SerializerMethodField()
    vendedor_nome = serializers.SerializerMethodField()
    empresa_nome = serializers.SerializerMethodField()
    km_percorrido = serializers.SerializerMethodField()
    etapa_display = serializers.CharField(source='get_ctrl_etapa_display', read_only=True)
    etapa_descricao = serializers.SerializerMethodField()
    
    class Meta:
        model = Controlevisita
        fields = [
            'ctrl_id',  # Adicionar esta linha
            'ctrl_empresa',
            'ctrl_filial', 
            'ctrl_cliente',
            'ctrl_numero',

            'ctrl_data',
            'ctrl_novo',
            'ctrl_base',
            'ctrl_prop',
            'ctrl_leva',
            'ctrl_proj',
            'ctrl_etapa',
            'ctrl_vendedor',
            'ctrl_obse',
            'ctrl_contato',
            'ctrl_fone',
            'ctrl_km_inic',
            'ctrl_km_fina',
            'ctrl_prox_visi',
            'ctrl_nume_orca',
            'cliente_nome',
            'vendedor_nome',
            'empresa_nome',
            'km_percorrido',
            'etapa_display',
            'etapa_descricao',
        ]
        read_only_fields = ['field_log_data', 'field_log_time', 'ctrl_id', ]  


    def validate(self, data):
        banco = self.context.get('banco')
        if not banco:
            raise serializers.ValidationError("Banco não encontrado")
        
        erros = {}
        obrigatorios = ['ctrl_empresa', 'ctrl_filial', 'ctrl_data', 'ctrl_cliente']
        
        for campo in obrigatorios:
            if not data.get(campo):
                erros[campo] = ['Este campo é obrigatório.']
        
        # Validar se KM final é maior que inicial
        if data.get('ctrl_km_inic') and data.get('ctrl_km_fina'):
            if data['ctrl_km_fina'] < data['ctrl_km_inic']:
                erros['ctrl_km_fina'] = ['KM final deve ser maior que KM inicial.']
        
        if erros:
            raise serializers.ValidationError(erros)
        
        return data
    
    def create(self, validated_data):
        banco = self.context.get('banco')
        if not banco:
            raise serializers.ValidationError("Banco não encontrado")
        
        # Gerar próximo número se não fornecido
        if not validated_data.get('ctrl_numero'):
            max_numero = Controlevisita.objects.using(banco).filter(
                ctrl_empresa=validated_data['ctrl_empresa'],
                ctrl_filial=validated_data['ctrl_filial']
            ).aggregate(Max('ctrl_numero'))['ctrl_numero__max'] or 0
            validated_data['ctrl_numero'] = max_numero + 1
        
        if not validated_data.get('ctrl_id'):
            max_id = Controlevisita.objects.using(banco).aggregate(Max('ctrl_id'))['ctrl_id__max'] or 0
            validated_data['ctrl_id'] = max_id + 1 

        
        return Controlevisita.objects.using(banco).create(**validated_data)
    
    def update(self, instance, validated_data):
        banco = self.context.get('banco')
        if not banco:
            raise serializers.ValidationError("Banco não encontrado")
        
        # Preservar ctrl_numero se não fornecido
        if 'ctrl_numero' not in validated_data:
            validated_data['ctrl_numero'] = instance.ctrl_numero
        
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save(using=banco)
        return instance

    def get_cliente_nome(self, obj):
        banco = self.context.get('banco')
        if not banco or not obj.ctrl_cliente:
            return None
        
        try:
            return obj.ctrl_cliente.enti_nome
        except Exception as e:
            logger.warning(f"Erro ao buscar nome do cliente: {e}")
            return None

    def get_vendedor_nome(self, obj):
        banco = self.context.get('banco')
        if not banco or not obj.ctrl_vendedor:
            return None
        
        try:
            return obj.ctrl_vendedor.enti_nome
        except Exception as e:
            logger.warning(f"Erro ao buscar nome do vendedor: {e}")
            return None

    def get_empresa_nome(self, obj):
        banco = self.context.get('banco')
        if not banco or not obj.ctrl_empresa:
            return None
        
        try:
            return obj.ctrl_empresa.empr_nome
        except Exception as e:
            logger.warning(f"Erro ao buscar nome da empresa: {e}")
            return None

    def get_km_percorrido(self, obj):
        return obj.km_percorrido


    def get_etapa_descricao(self, obj):
        if obj.ctrl_etapa:
            return obj.ctrl_etapa.etap_descricao
        return None

class EtapaVisitaSerializer(serializers.ModelSerializer):
    empresa_nome = serializers.SerializerMethodField()
    
    class Meta:
        model = Etapavisita
        fields = [
            'etap_id',
            'etap_nume', 
            'etap_descricao',
            'etap_empr',
            'etap_obse',
            'empresa_nome'
        ]
        read_only_fields = ['etap_id']
    
    def validate(self, data):
        banco = self.context.get('banco')
        if not banco:
            raise serializers.ValidationError("Banco não encontrado")
        
        erros = {}
        obrigatorios = ['etap_empr', 'etap_nume', 'etap_descricao']
        
        for campo in obrigatorios:
            if not data.get(campo):
                erros[campo] = ['Este campo é obrigatório.']
        
        if erros:
            raise serializers.ValidationError(erros)
        
        return data
    
    def create(self, validated_data):
        banco = self.context.get('banco')
        if not banco:
            raise serializers.ValidationError("Banco não encontrado")
        
        return Etapavisita.objects.using(banco).create(**validated_data)
    
    def update(self, instance, validated_data):
        banco = self.context.get('banco')
        if not banco:
            raise serializers.ValidationError("Banco não encontrado")
        
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save(using=banco)
        return instance
    
    def get_empresa_nome(self, obj):
        banco = self.context.get('banco')
        if not banco or not obj.etap_empr:
            return None
        
        try:
            return obj.etap_empr.empr_nome
        except Exception as e:
            logger.warning(f"Erro ao buscar nome da empresa: {e}")
            return None
    
    def get_etapa_descricao(self, obj):
        if obj.ctrl_etapa:
            return obj.ctrl_etapa.etap_descricao
        return None



class ItensVisitaSerializer(serializers.ModelSerializer):
    valor_total_calculado = serializers.SerializerMethodField()
    
    class Meta:
        model = ItensVisita
        fields = [
            'item_id', 'item_empr', 'item_fili', 'item_visita',
            'item_prod', 'item_desc_prod', 'item_quan', 'item_unit',
            'item_tota', 'item_desc', 'item_unli', 'item_data',
            'item_obse', 'valor_total_calculado'
        ]
        read_only_fields = ['item_id', 'item_data', 'valor_total_calculado']
    
    def get_valor_total_calculado(self, obj):
        if obj.item_quan and obj.item_unit:
            total_bruto = float(obj.item_quan) * float(obj.item_unit)
            desconto = float(obj.item_desc or 0)
            return total_bruto - desconto
        return 0
    
    def validate(self, data):
        banco = self.context.get('banco')
        if not banco:
            raise serializers.ValidationError("Banco não encontrado")
            
        erros = {}
        
        # Validar campos obrigatórios
        obrigatorios = ['item_empr', 'item_fili', 'item_visita', 'item_prod']
        for campo in obrigatorios:
            if not data.get(campo):
                erros[campo] = ['Este campo é obrigatório.']
        
        # Validar quantidade e valor
        if data.get('item_quan') is not None:
            try:
                quan = float(data['item_quan'])
                if quan <= 0:
                    erros['item_quan'] = ['Quantidade deve ser maior que zero']
            except (ValueError, TypeError):
                erros['item_quan'] = ['Quantidade deve ser um número válido']
                
        if data.get('item_unit') is not None:
            try:
                unit = float(data['item_unit'])
                if unit <= 0:
                    erros['item_unit'] = ['Valor unitário deve ser maior que zero']
            except (ValueError, TypeError):
                erros['item_unit'] = ['Valor unitário deve ser um número válido']
        
        # Validar se visita existe
        if data.get('item_visita'):
            visita_id = data['item_visita']
            if hasattr(visita_id, 'ctrl_id'):
                visita_id = visita_id.ctrl_id
            try:
                if not Controlevisita.objects.using(banco).filter(ctrl_id=visita_id).exists():
                    erros['item_visita'] = ['Visita não encontrada']
            except Exception:
                erros['item_visita'] = ['Erro ao validar visita']
        
        if erros:
            raise serializers.ValidationError(erros)
            
        return data
    
    def create(self, validated_data):
        banco = self.context.get('banco')
        if not banco:
            raise serializers.ValidationError("Banco não encontrado")
        
        # Calcular total antes de salvar
        if validated_data.get('item_quan') and validated_data.get('item_unit'):
            quan = float(validated_data['item_quan'])
            unit = float(validated_data['item_unit'])
            desc = float(validated_data.get('item_desc', 0))
            validated_data['item_tota'] = (quan * unit) - desc
        
        return ItensVisita.objects.using(banco).create(**validated_data)
    
    def update(self, instance, validated_data):
        banco = self.context.get('banco')
        if not banco:
            raise serializers.ValidationError("Banco não encontrado")
        
        # Calcular total antes de atualizar
        if validated_data.get('item_quan') and validated_data.get('item_unit'):
            quan = float(validated_data['item_quan'])
            unit = float(validated_data['item_unit'])
            desc = float(validated_data.get('item_desc', 0))
            validated_data['item_tota'] = (quan * unit) - desc
        
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save(using=banco)
        return instance

class ExportarVisitaParaOrcamentoSerializer(serializers.Serializer):
    visita_id = serializers.IntegerField()
    observacoes_orcamento = serializers.CharField(max_length=500, required=False, allow_blank=True)
    
    def validate_visita_id(self, value):
        banco = self.context.get('banco')
        if not Controlevisita.objects.using(banco).filter(ctrl_id=value).exists():
            raise serializers.ValidationError('Visita não encontrada')
        return value

    def create(self, validated_data):
        visita_id = validated_data["visita_id"]
        visita = Controlevisita.objects.filter(ctrl_id=visita_id).first()

        if visita.ctrl_nume_orca:
            raise ValueError("Essa visita já possui um orçamento vinculado.")

        orcamento = Orcamentos.objects.create(
            pedi_empr=visita.ctrl_empresa.id if visita.ctrl_empresa else None,
            pedi_fili=visita.ctrl_filial,
            pedi_forn=visita.ctrl_cliente.id if visita.ctrl_cliente else None,
            pedi_data=visita.ctrl_data,
            pedi_vend=visita.ctrl_vendedor.id if visita.ctrl_vendedor else None,
            pedi_obse=visita.ctrl_obse,
            pedi_tota=0,
        )

        itens_visita = ItensVisita.objects.filter(item_visita=visita)
        total = 0
        for idx, item in enumerate(itens_visita, start=1):
            tota = (item.item_quan or 0) * (item.item_unit or 0)
            total += tota
            ItensOrcamento.objects.create(
                iped_empr=item.item_empr,
                iped_fili=item.item_fili,
                iped_pedi=orcamento.pedi_nume,
                iped_item=idx,
                iped_prod=item.item_prod,
                iped_quan=item.item_quan,
                iped_unit=item.item_unit,
                iped_tota=tota,
                iped_desc=item.item_desc or 0,
                iped_unli=item.item_unli,
                iped_data=item.item_data or visita.ctrl_data,
            )

        orcamento.pedi_tota = total
        orcamento.save(update_fields=["pedi_tota"])
        visita.ctrl_nume_orca = orcamento.pedi_nume
        visita.save(update_fields=["ctrl_nume_orca"])

        return orcamento