import { ValueTypeBuilder } from '@stevenkellner/typescript-common-functionality';
import { IFirebaseFunction } from '@stevenkellner/firebase-function/client';
import { FirebaseFunction as FirebaseAdminFunction, FirebaseRequest as FirebaseAdminRequest, FirebaseSchedule as FirebaseAdminSchedule } from '@stevenkellner/firebase-function/admin';
import { Invitation, User } from '../src/types';

abstract class FirebaseFunction<Function extends FirebaseAdminFunction<any, any>> extends IFirebaseFunction<FirebaseAdminFunction.Parameters<Function>, FirebaseAdminFunction.ReturnType<Function>> {}

import { TeamNewFunction } from '../src/functions/team/new';
import { UserLoginFunction } from '../src/functions/user/login';
import { UserRoleEditFunction } from '../src/functions/user/roleEdit';
import { PaypalMeEditFunction } from '../src/functions/paypalMe/edit';
import { NotificationRegisterFunction } from '../src/functions/notification/register';
import { NotificationSubscribeFunction } from '../src/functions/notification/subscribe';
import { InvitationInviteFunction } from '../src/functions/invitation/invite';
import { InvitationWithdrawFunction } from '../src/functions/invitation/withdraw';
import { InvitationRegisterFunction } from '../src/functions/invitation/register';
import { PersonAddFunction } from '../src/functions/person/add';
import { PersonUpdateFunction } from '../src/functions/person/update';
import { PersonDeleteFunction } from '../src/functions/person/delete';
import { FineTemplateAddFunction } from '../src/functions/fineTemplate/add';
import { FineTemplateUpdateFunction } from '../src/functions/fineTemplate/update';
import { FineTemplateDeleteFunction } from '../src/functions/fineTemplate/delete';
import { FineAddFunction } from '../src/functions/fine/add';
import { FineUpdateFunction } from '../src/functions/fine/update';
import { FineDeleteFunction } from '../src/functions/fine/delete';

export class TeamNewClientFunction extends FirebaseFunction<TeamNewFunction> {

    public returnTypeBuilder = User.builder;
}

export class UserLoginClientFunction extends FirebaseFunction<UserLoginFunction> {

    public returnTypeBuilder = User.builder;
}

export class UserRoleEditClientFunction extends FirebaseFunction<UserRoleEditFunction> {

    public returnTypeBuilder = new ValueTypeBuilder<void>();
}

export class PaypalMeEditClientFunction extends FirebaseFunction<PaypalMeEditFunction> {

    public returnTypeBuilder = new ValueTypeBuilder<void>();
}

export class NotificationRegisterClientFunction extends FirebaseFunction<NotificationRegisterFunction> {

    public returnTypeBuilder = new ValueTypeBuilder<void>();
}

export class NotificationSubscribeClientFunction extends FirebaseFunction<NotificationSubscribeFunction> {

    public returnTypeBuilder = new ValueTypeBuilder<void>();
}

export class InvitationInviteClientFunction extends FirebaseFunction<InvitationInviteFunction> {

    public returnTypeBuilder = Invitation.Id.builder;
}

export class InvitationWithdrawClientFunction extends FirebaseFunction<InvitationWithdrawFunction> {

    public returnTypeBuilder = new ValueTypeBuilder<void>();
}

export class InvitationRegisterClientFunction extends FirebaseFunction<InvitationRegisterFunction> {

    public returnTypeBuilder = User.builder;
}

export class PersonAddClientFunction extends FirebaseFunction<PersonAddFunction> {

    public returnTypeBuilder = new ValueTypeBuilder<void>();
}

export class PersonUpdateClientFunction extends FirebaseFunction<PersonUpdateFunction> {

    public returnTypeBuilder = new ValueTypeBuilder<void>();
}

export class PersonDeleteClientFunction extends FirebaseFunction<PersonDeleteFunction> {

    public returnTypeBuilder = new ValueTypeBuilder<void>();
}

export class FineTemplateAddClientFunction extends FirebaseFunction<FineTemplateAddFunction> {

    public returnTypeBuilder = new ValueTypeBuilder<void>();
}

export class FineTemplateUpdateClientFunction extends FirebaseFunction<FineTemplateUpdateFunction> {

    public returnTypeBuilder = new ValueTypeBuilder<void>();
}

export class FineTemplateDeleteClientFunction extends FirebaseFunction<FineTemplateDeleteFunction> {

    public returnTypeBuilder = new ValueTypeBuilder<void>();
}

export class FineAddClientFunction extends FirebaseFunction<FineAddFunction> {

    public returnTypeBuilder = new ValueTypeBuilder<void>();
}

export class FineUpdateClientFunction extends FirebaseFunction<FineUpdateFunction> {

    public returnTypeBuilder = new ValueTypeBuilder<void>();
}

export class FineDeleteClientFunction extends FirebaseFunction<FineDeleteFunction> {

    public returnTypeBuilder = new ValueTypeBuilder<void>();
}

import { firebaseFunctions } from '../src/firebaseFunctions';
import { FirebaseFunctions } from '@stevenkellner/firebase-function/admin';
import { FirebaseFunction as FirebaseClientFunction, FirebaseRequest as FirebaseClientRequest } from '@stevenkellner/firebase-function/client';

type ClientFunctions_Internal<Functions extends FirebaseFunctions> =
        Functions extends FirebaseAdminFunction.ConstructorWrapper<unknown, unknown> ? FirebaseClientFunction<FirebaseAdminFunction.Parameters<Functions>, FirebaseAdminFunction.ReturnType<Functions>> :
            Functions extends FirebaseAdminRequest.ConstructorWrapper<unknown, unknown> ? FirebaseClientRequest<FirebaseAdminRequest.Parameters<Functions>, FirebaseAdminRequest.ReturnType<Functions>> :
                Functions extends FirebaseAdminSchedule.ConstructorWrapper ? never :
                    Functions extends Record<string, any> ? { [Key in keyof Functions]: ClientFunctions_Internal<Functions[Key]> } : never;

export type ClientFunctions = ClientFunctions_Internal<typeof firebaseFunctions>;
