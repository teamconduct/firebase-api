import { FirebaseFunctionsContext } from '@stevenkellner/firebase-function';
import { TeamNewFunction } from './functions/team/new';
import { UserLoginFunction } from './functions/user/login';
import { UserRoleEditFunction } from './functions/user/roleEdit';
import { PaypalMeEditFunction } from './functions/paypalMe/edit';
import { NotificationRegisterFunction } from './functions/notification/register';
import { NotificationSubscribeFunction } from './functions/notification/subscribe';
import { InvitationInviteFunction } from './functions/invitation/invite';
import { InvitationWithdrawFunction } from './functions/invitation/withdraw';
import { InvitationRegisterFunction } from './functions/invitation/register';
import { PersonAddFunction } from './functions/person/add';
import { PersonUpdateFunction } from './functions/person/update';
import { PersonDeleteFunction } from './functions/person/delete';
import { FineAddFunction } from './functions/fine/add';
import { FineUpdateFunction } from './functions/fine/update';
import { FineDeleteFunction } from './functions/fine/delete';
import { FineTemplateAddFunction } from './functions/fineTemplate/add';
import { FineTemplateUpdateFunction } from './functions/fineTemplate/update';
import { FineTemplateDeleteFunction } from './functions/fineTemplate/delete';

export const firebaseFunctionsContext = FirebaseFunctionsContext.build(builder => ({
    team: {
        new: builder.function(TeamNewFunction)
    },
    user: {
        login: builder.function(UserLoginFunction),
        roleEdit: builder.function(UserRoleEditFunction)
    },
    paypalMe: {
        edit: builder.function(PaypalMeEditFunction)
    },
    notification: {
        register: builder.function(NotificationRegisterFunction),
        subscribe: builder.function(NotificationSubscribeFunction)
    },
    invitation: {
        invite: builder.function(InvitationInviteFunction),
        withdraw: builder.function(InvitationWithdrawFunction),
        register: builder.function(InvitationRegisterFunction)
    },
    person: {
        add: builder.function(PersonAddFunction),
        update: builder.function(PersonUpdateFunction),
        delete: builder.function(PersonDeleteFunction)
    },
    fineTemplate: {
        add: builder.function(FineTemplateAddFunction),
        update: builder.function(FineTemplateUpdateFunction),
        delete: builder.function(FineTemplateDeleteFunction)
    },
    fine: {
        add: builder.function(FineAddFunction),
        update: builder.function(FineUpdateFunction),
        delete: builder.function(FineDeleteFunction)
    }
}));
