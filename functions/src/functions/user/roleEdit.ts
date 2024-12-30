import { FirebaseFunction, FunctionsError } from "@stevenkellner/firebase-function/admin";
import { checkAuthentication } from "../../checkAuthentication";
import { Person, Team, UserRole } from "../../types";
import { ArrayTypeBuilder, Flattable, ObjectTypeBuilder, ValueTypeBuilder } from "@stevenkellner/typescript-common-functionality";
import { Firestore } from "../../Firestore";

export namespace UserRoleEditFunction {

    export type Parameters = {
        teamId: Team.Id
        personId: Person.Id
        roles: UserRole[]
    };
}

export class UserRoleEditFunction extends FirebaseFunction<UserRoleEditFunction.Parameters, void> {

    public parametersBuilder = new ObjectTypeBuilder<Flattable.Flatten<UserRoleEditFunction.Parameters>, UserRoleEditFunction.Parameters>({
        teamId: Team.Id.builder,
        personId: Person.Id.builder,
        roles: new ArrayTypeBuilder(new ValueTypeBuilder())
    });

    public constructor() {
        super('UserRoleEditFunction');
    }

    public async execute(parameters: UserRoleEditFunction.Parameters): Promise<void> {
        this.logger.log('UserRoleEditFunction.execute');

        const userId = await checkAuthentication(this.userId, parameters.teamId, 'team-manager');

        const personSnapshot = await Firestore.shared.person(parameters.teamId, parameters.personId).snapshot();
        if (!personSnapshot.exists)
            throw new FunctionsError('not-found', 'User does not exist');
        const person = Person.builder.build(personSnapshot.data);

        if (person.signInProperties === null)
            throw new FunctionsError('permission-denied', 'User is not signed in');

        if (person.signInProperties.userId.value === userId.value && !parameters.roles.includes('team-manager'))
            throw new FunctionsError('unavailable', 'User cannot remove their own team-manager role');

        person.signInProperties.roles = parameters.roles;
        await Firestore.shared.person(parameters.teamId, parameters.personId).set(person);
    }
}
