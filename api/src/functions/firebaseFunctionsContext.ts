import { FirebaseFunctionsContext } from '@stevenkellner/firebase-function';
import { TeamNewFunction,
    UserLoginFunction, UserRegisterFunction,
    PaypalMeEditFunction, NotificationRegisterFunction, NotificationSubscribeFunction,
    InvitationInviteFunction, InvitationWithdrawFunction, InvitationGetInvitationFunction, InvitationRegisterFunction,
    PersonAddFunction, PersonDeleteFunction, PersonUpdateFunction, UserKickoutFunction, UserRoleEditFunction,
    FineTemplateAddFunction, FineTemplateDeleteFunction, FineTemplateUpdateFunction,
    FineAddFunction, FineDeleteFunction, FineUpdateFunction
} from '.';

export const firebaseFunctionsContext = FirebaseFunctionsContext.build(builder => ({
    team: {
        new: builder.function(TeamNewFunction)
    },
    user: {
        login: builder.function(UserLoginFunction),
        register: builder.function(UserRegisterFunction)
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
        getInvitation: builder.function(InvitationGetInvitationFunction),
        register: builder.function(InvitationRegisterFunction)
    },
    person: {
        add: builder.function(PersonAddFunction),
        update: builder.function(PersonUpdateFunction),
        delete: builder.function(PersonDeleteFunction),
        kickout: builder.function(UserKickoutFunction),
        roleEdit: builder.function(UserRoleEditFunction)
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
