import { FirebaseFunctionsContext } from '@stevenkellner/firebase-function';
import { TeamNewFunction, UserLoginFunction, UserRoleEditFunction,
    PaypalMeEditFunction, NotificationRegisterFunction, NotificationSubscribeFunction,
    InvitationInviteFunction, InvitationRegisterFunction, InvitationWithdrawFunction,
    PersonAddFunction, PersonDeleteFunction, PersonUpdateFunction,
    FineTemplateAddFunction, FineTemplateDeleteFunction, FineTemplateUpdateFunction,
    FineAddFunction, FineDeleteFunction, FineUpdateFunction
} from './functions';

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
