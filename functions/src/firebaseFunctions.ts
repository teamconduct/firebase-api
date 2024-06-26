import { createFirebaseFunctions } from 'firebase-function';
import { TeamNewFunction } from './functions/TeamNewFunction';
import { PersonAddFunction } from './functions/PersonAddFunction';
import { FineTemplateAddFunction } from './functions/FineTemplateAddFunction';
import { FineAddFunction } from './functions/FineAddFunction';
import { PersonUpdateFunction } from './functions/PersonUpdateFunction';
import { FineTemplateUpdateFunction } from './functions/FineTemplateUpdateFunction';
import { FineUpdateFunction } from './functions/FineUpdateFunction';
import { FineTemplateDeleteFunction } from './functions/FineTemplateDeleteFunction';
import { FineDeleteFunction } from './functions/FineDeleteFunction';
import { PersonDeleteFunction } from './functions/PersonDeleteFunction';
import { UserRoleEditFunction } from './functions/UserRoleEditFunction';
import { PaypalMeEditFunction } from './functions/PaypalMeEditFunction';
import { NotificationRegisterFunction } from './functions/NotificationRegisterFunction';
import { NotificationSubscribeFunction } from './functions/NotificationSubscribeFunction';
import { InvitationInviteFunction } from './functions/InvitationInviteFunction';
import { InvitationWithdrawFunction } from './functions/InvitationWithdrawFunction';
import { UserLoginFunction } from './functions/UserLoginFunction';
import { InvitationRegisterFunction } from './functions/InvitationRegisterFunction';

export const firebaseFunctions = createFirebaseFunctions(builder => ({
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
