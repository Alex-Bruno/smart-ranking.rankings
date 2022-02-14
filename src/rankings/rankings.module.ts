import { ProxyrmqModule } from './../proxyrmq/proxyrmq.module';
import { RankingSchema } from './interfaces/ranking.schema';
import { Module } from '@nestjs/common';
import { RankingsService } from './rankings.service';
import { RankingsController } from './rankings.controller';
import { MongooseModule } from '@nestjs/mongoose';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'Ranking', schema: RankingSchema }
    ]),
    ProxyrmqModule,
  ],
  providers: [RankingsService],
  controllers: [RankingsController]
})
export class RankingsModule { }
