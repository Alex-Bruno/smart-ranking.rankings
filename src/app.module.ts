import { Module } from '@nestjs/common';
import { RankingsModule } from './rankings/rankings.module';
import { MongooseModule} from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';
import { ProxyrmqModule } from './proxyrmq/proxyrmq.module';

@Module({
  imports: [
    ConfigModule.forRoot({isGlobal: true}),
    MongooseModule.forRoot(
      'mongodb+srv://root:A5m9RDBYVVDfKtV@cluster0.y1eby.mongodb.net/srrankings?retryWrites=true&w=majority',
      { useNewUrlParser: true, useUnifiedTopology: true }
    ),
    RankingsModule,
    ProxyrmqModule
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
