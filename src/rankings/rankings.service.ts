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

@Injectable()
export class RankingsService {

    constructor(
        @InjectModel('Ranking') private readonly desafioModel: Model<Ranking>,
        private readonly clientProxySmartRanking: ClientProxySmartRanking
    ) { }

    private readonly logger = new Logger(RankingsService.name);

    private clientAdminBackend = this.clientProxySmartRanking.getClientProxyAdminBackendInstance();

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

}
