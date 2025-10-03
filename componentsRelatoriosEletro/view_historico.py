from rest_framework import viewsets, pagination
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django_filters.rest_framework import DjangoFilterBackend
from collections import defaultdict, Counter
from .models import HistoricoWorkflow
from .serializers_historico import HistoricoWorkflowSerializer
from core.registry import get_licenca_db_config


class PaginacaoResultados(pagination.PageNumberPagination):
    page_size = 10
    page_size_query_param = 'page_size'
    max_page_size = 100


def segundos_para_hhmmss(segundos):
    horas = int(segundos // 3600)
    minutos = int((segundos % 3600) // 60)
    segundos_rest = int(segundos % 60)
    return f"{horas:02d}:{minutos:02d}:{segundos_rest:02d}"


class HistoricoWorkflowViewSet(viewsets.ReadOnlyModelViewSet):
    """
    Endpoint para histórico de workflows.
    Retorna:
    1) Detalhe por OS: tempo em cada setor, setor que mais/menos demorou
    2) Resumo geral por setor: total de tempo acumulado
    """
    serializer_class = HistoricoWorkflowSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['hist_empr', 'hist_fili', 'hist_orde']
    pagination_class = PaginacaoResultados

    def get_queryset(self):
        banco = get_licenca_db_config(self.request) or 'default'
        empresa_id = self.request.headers.get("X-Empresa") or self.request.query_params.get('hist_empr')
        filial_id = self.request.headers.get("X-Filial") or self.request.query_params.get('hist_fili')
        return HistoricoWorkflow.objects.using(banco).filter(
            hist_empr=empresa_id,
            hist_fili=filial_id
        ).order_by('hist_orde', 'hist_data')

    def list(self, request, *args, **kwargs):
        queryset = self.get_queryset()

        # --- CALCULO DE TEMPOS ---
        tempos_por_os = defaultdict(lambda: defaultdict(int))
        workflows = defaultdict(list)

        for h in queryset:
            workflows[h.hist_orde].append(h)

        for ordem, eventos in workflows.items():
            eventos.sort(key=lambda x: x.hist_data)
            for i in range(len(eventos) - 1):
                atual = eventos[i]
                proximo = eventos[i + 1]
                setor = atual.hist_seto_dest
                delta = (proximo.hist_data - atual.hist_data).total_seconds()
                tempos_por_os[ordem][setor] += delta

        # --- DETALHE POR OS ---
        detalhe_os = []
        resumo_setor_total = Counter()

        for ordem, setores in tempos_por_os.items():
            setores_dict = {s: segundos_para_hhmmss(sec) for s, sec in setores.items()}
            setor_mais = max(setores.items(), key=lambda x: x[1])
            setor_menos = min(setores.items(), key=lambda x: x[1])
            detalhe_os.append({
                "ordem": ordem,
                "tempos_por_setor": setores_dict,
                "setor_mais_tempo": {
                    "setor": setor_mais[0],
                    "segundos": setor_mais[1],
                    "hhmmss": segundos_para_hhmmss(setor_mais[1])
                },
                "setor_menos_tempo": {
                    "setor": setor_menos[0],
                    "segundos": setor_menos[1],
                    "hhmmss": segundos_para_hhmmss(setor_menos[1])
                },
            })
            for setor, segundos in setores.items():
                resumo_setor_total[setor] += segundos

        # --- RESUMO GERAL POR SETOR ---
        resumo_setor = [
            {
                "setor": setor,
                "total_segundos": total,
                "total_hhmmss": segundos_para_hhmmss(total)
            }
            for setor, total in resumo_setor_total.items()
        ]
        resumo_setor = sorted(resumo_setor, key=lambda x: x["total_segundos"], reverse=True)

        # --- PAGINAÇÃO ---
        page = self.paginate_queryset(detalhe_os)
        if page is not None:
            return self.get_paginated_response({
                "detalhe_por_os": page,
                "resumo_setor_total": resumo_setor
            })

        return Response({
            "detalhe_por_os": detalhe_os,
            "resumo_setor_total": resumo_setor
        })

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context['banco'] = get_licenca_db_config(self.request)
        return context