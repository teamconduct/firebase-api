import { FirebaseFunctionsContext } from '@stevenkellner/firebase-function';
import {
    UserLoginFunction, UserUpdateFunction, UserRegisterFunction,
    TeamNewFunction, TeamUpdateFunction, TeamDeleteFunction,
    PersonAddFunction, PersonDeleteFunction, PersonUpdateFunction, PersonKickoutFunction, PersonRoleEditFunction,
    FineTemplateAddFunction, FineTemplateDeleteFunction, FineTemplateUpdateFunction,
    FineAddFunction, FineDeleteFunction, FineUpdateFunction
    // PaypalMeEditFunction, NotificationRegisterFunction, NotificationSubscribeFunction,
    // InvitationInviteFunction, InvitationWithdrawFunction, InvitationGetInvitationFunction, InvitationRegisterFunction,
} from '.';

export const firebaseFunctionsContext = FirebaseFunctionsContext.build(builder => ({
    user: {
        login: builder.function(UserLoginFunction),
        update: builder.function(UserUpdateFunction),
        register: builder.function(UserRegisterFunction)
    },
    team: {
        new: builder.function(TeamNewFunction),
        update: builder.function(TeamUpdateFunction),
        delete: builder.function(TeamDeleteFunction)
    },
    person: {
        add: builder.function(PersonAddFunction),
        update: builder.function(PersonUpdateFunction),
        delete: builder.function(PersonDeleteFunction),
        kickout: builder.function(PersonKickoutFunction),
        roleEdit: builder.function(PersonRoleEditFunction)
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
    // notification: {
    //     register: builder.function(NotificationRegisterFunction)
    // },
    // invitation: {
    //     invite: builder.function(InvitationInviteFunction),
    //     withdraw: builder.function(InvitationWithdrawFunction),
    //     getInvitation: builder.function(InvitationGetInvitationFunction),
    //     register: builder.function(InvitationRegisterFunction)
    // },
}));
