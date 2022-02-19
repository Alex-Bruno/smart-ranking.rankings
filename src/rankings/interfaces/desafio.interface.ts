import { DesafioStatus } from "../desafio-status.enum";

export interface Desafio {

    _id?: string
    dataHoraDesafio: Date
    status: DesafioStatus
    dataHoraSolicitacao: Date
    dataHoraResposta?: Date
    solicitante: string
    categoria: string
    jogadores: string[]
    partida?: string

}