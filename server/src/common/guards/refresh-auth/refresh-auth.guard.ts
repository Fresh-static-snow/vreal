import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { StrategyKeys } from '@src/common/types';

@Injectable()
export class RefreshAuthGuard extends AuthGuard(StrategyKeys.Refresh) {}
