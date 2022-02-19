import { Desafio } from './interfaces/desafio.interface';
import { EventoNome } from './evento-nome.enum';
import { Categoria } from './interfaces/categoria.interface';
import { ClientProxySmartRanking } from './../proxyrmq/client-proxy';
import { Partida } from './interfaces/partida.interface';
import { Ranking } from './interfaces/ranking.schema';
import { Injectable, Logger } from '@nestjs/common';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { RpcException } from '@nestjs/microservices';
import { lastValueFrom } from 'rxjs';
import * as momentTimezone from 'moment-timezone';
import * as _ from 'lodash';
import { Historico, RankingResponse } from './interfaces/ranking-response.interface';

@Injectable()
export class RankingsService {

    constructor(
        @InjectModel('Ranking') private readonly desafioModel: Model<Ranking>,
        private readonly clientProxySmartRanking: ClientProxySmartRanking
    ) { }

    private readonly logger = new Logger(RankingsService.name);

    private clientAdminBackend = this.clientProxySmartRanking.getClientProxyAdminBackendInstance();

    private clientDesafios = this.clientProxySmartRanking.getClientProxyDesafiosInstance();

    async processarPartida(idPartida: string, partida: Partida): Promise<void> {

        try {

            const categoria: Categoria = await lastValueFrom(this.clientAdminBackend.send('consultar-categorias', partida.categoria));

            await Promise.all(partida.jogadores.map(async jogador => {

                const ranking = new this.desafioModel();

                ranking.categoria = partida.categoria;
                ranking.desafio = partida.desafio;
                ranking.partida = idPartida;
                ranking.jogador = jogador;

                if (jogador == partida.def) {

                    const eventoFilter = categoria.eventos.filter(
                        evento => evento.nome == EventoNome.VITORIA
                    );

                    ranking.evento = EventoNome.VITORIA;
                    ranking.pontos = eventoFilter[0].valor;
                    ranking.operacao = eventoFilter[0].operacao;

                } else {

                    const eventoFilter = categoria.eventos.filter(
                        evento => evento.nome == EventoNome.DERROTA
                    );

                    ranking.evento = EventoNome.DERROTA;
                    ranking.pontos = eventoFilter[0].valor;
                    ranking.operacao = eventoFilter[0].operacao;

                }

                this.logger.log(`ranking: ${JSON.stringify(ranking)}`);

                await ranking.save();

            }));

        } catch (error) {

            this.logger.log(`error: ${error.message}`);
            throw new RpcException(error.message);

        }
    }

    async consultarRankings(idCategoria: any, dataRef: string): Promise<RankingResponse[] | RankingResponse> {

        try {

            this.logger.log(`idCategoria: ${idCategoria} dataRef: ${dataRef}`)

            if (!dataRef) {
                dataRef = momentTimezone().tz("America/Sao_Paulo").format('YYYY-MM-DD');
                this.logger.log(`dataRef: ${dataRef}`);
            }

            const registrosRankings = await this.desafioModel.find()
                .where('categoria')
                .equals(idCategoria)
                .exec();

            this.logger.log(`registrosRanking: ${JSON.stringify(registrosRankings)}`);

            const desafios: Desafio[] = await lastValueFrom(
                this.clientDesafios.send('consultar-desafios-realizados', {
                    idCategoria: idCategoria, dataRef: dataRef
                })
            );

            this.logger.log(`desadios: ${JSON.stringify(desafios)}`);

            _.remove(registrosRankings, function (item) {
                return desafios.filter(desafio => desafio._id == item.desafio).length == 0
            });

            this.logger.log(`registrosNovos: ${JSON.stringify(registrosRankings)}`);

            const resultado = _(registrosRankings)
                .groupBy('jogador')
                .map((items, key) => ({
                    'jogador': key,
                    'historico': _.countBy(items, 'evento'),
                    'pontos': _.sumBy(items, 'pontos')
                }))
                .value();

            this.logger.log(`resultado: ${JSON.stringify(resultado)}`);

            const resultadoOrdenado = _.orderBy(resultado, 'pontos', 'desc');

            this.logger.log(`resultadoOrdenado: ${JSON.stringify(resultadoOrdenado)}`);

            const rankingResponseList: RankingResponse[] = [];

            resultadoOrdenado.map(function(item, index) {
                const rankingResponse: RankingResponse = {};

                rankingResponse.jogador = item.jogador;
                rankingResponse.posicao = index + 1;
                rankingResponse.pontuacao = item.pontos;
                
                const historico: Historico = {};
                historico.vitorias = (item.historico.VITORIA) ? item.historico.VITORIA : 0;
                historico.derrotas = (item.historico.DERROTA) ? item.historico.DERROTA : 0;
                
                rankingResponse.historicoPartida = historico;
                
                rankingResponseList.push(rankingResponse);
                return rankingResponseList;
            });

            return rankingResponseList;
        } catch (error) {
            this.logger.error(`error: ${JSON.stringify(error.message)}`);

            throw new RpcException(error.message);
        }

    }
}
