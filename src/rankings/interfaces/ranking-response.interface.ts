export interface RankingResponse {

    jogador?: string;
    posicao?: number;
    pontuacao?: number;
    historicoPartida?: Historico;

}

export interface Historico {
    vitorias?: number;
    derrotas?: number;
}