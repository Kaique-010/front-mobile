from .models import ControleVisita, ItensVisita
from orcamentos.models import Orcamentos, ItensOrcamento

def exportar_visita_para_orcamento(visita: ControleVisita):
    """
    Cria um orçamento a partir de uma visita e seus itens.
    """
    if visita.ctrl_nume_orca:
        raise ValueError("Essa visita já possui um orçamento vinculado.")

    orc = Orcamentos.objects.create(
        pedi_empr=visita.ctrl_empresa.id if visita.ctrl_empresa else None,
        pedi_fili=visita.ctrl_filial,
        pedi_forn=visita.ctrl_cliente.id if visita.ctrl_cliente else None,
        pedi_data=visita.ctrl_data,
        pedi_vend=visita.ctrl_vendedor.id if visita.ctrl_vendedor else None,
        pedi_obse=visita.ctrl_obse,
        pedi_tota=0,
    )

    total = 0
    itens = []
    for idx, item in enumerate(visita.itens_visita.all(), start=1):
        tota = (item.item_quan or 0) * (item.item_unit or 0)
        total += tota
        itens.append(ItensOrcamento(
            iped_empr=item.item_empr,
            iped_fili=item.item_fili,
            iped_pedi=orc.pedi_nume,
            iped_item=idx,
            iped_prod=item.item_prod,
            iped_quan=item.item_quan,
            iped_unit=item.item_unit,
            iped_tota=tota,
            iped_desc=item.item_desc or 0,
            iped_unli=item.item_unli,
            iped_data=item.item_data or visita.ctrl_data,
        ))

    ItensOrcamento.objects.bulk_create(itens)
    orc.pedi_tota = total
    orc.save(update_fields=["pedi_tota"])

    visita.ctrl_nume_orca = orc.pedi_nume
    visita.save(update_fields=["ctrl_nume_orca"])

    return orc