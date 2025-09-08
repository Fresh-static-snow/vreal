import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { StrategyKeys } from '@src/common/types';

@Injectable()
export class GoogleAuthGuard extends AuthGuard(StrategyKeys.Google) {}
