import { ClientProxySmartRanking } from './client-proxy';
import { Module } from '@nestjs/common';

@Module({
    providers: [ClientProxySmartRanking],
    exports: [ClientProxySmartRanking],
})
export class ProxyrmqModule {}
