import { Flattable, ObjectTypeBuilder, UtcDate, ValueTypeBuilder } from '@stevenkellner/typescript-common-functionality';
import { FirebaseFunction, FunctionsError } from '@stevenkellner/firebase-function';
import { Person, PersonPrivateProperties, PersonSignInProperties, User, UserRole, Team, NotificationProperties } from '../../types';
import { Firestore } from '../../Firestore';

export namespace TeamNewFunction {

    export type Parameters = {
        id: Team.Id
        name: string
        paypalMeLink: string | null
        personId: Person.Id
        personProperties: PersonPrivateProperties
    }
}

export class TeamNewFunction extends FirebaseFunction<TeamNewFunction.Parameters, User> {

    public parametersBuilder = new ObjectTypeBuilder<Flattable.Flatten<TeamNewFunction.Parameters>, TeamNewFunction.Parameters>({
        id: Team.Id.builder,
        name: new ValueTypeBuilder(),
        paypalMeLink: new ValueTypeBuilder(),
        personId: Person.Id.builder,
        personProperties: PersonPrivateProperties.builder
    });

    public returnTypeBuilder = User.builder;

    public async execute(parameters: TeamNewFunction.Parameters): Promise<User> {

        if (this.userId === null)
            throw new FunctionsError('permission-denied', 'User is not authenticated');
        const userId = User.Id.builder.build(this.userId);

        const teamSnapshot = await Firestore.shared.team(parameters.id).snapshot();
        if (teamSnapshot.exists)
            throw new FunctionsError('already-exists', 'Team already exists');

        const userSnapshot = await Firestore.shared.user(userId).snapshot();
        let user = new User(userId);
        if (userSnapshot.exists)
            user = User.builder.build(userSnapshot.data);

        user.teams.set(parameters.id, new User.TeamProperties(parameters.name, parameters.personId));
        await Firestore.shared.user(userId).set(user);

        await Firestore.shared.team(parameters.id).set(new Team(parameters.id, parameters.name, parameters.paypalMeLink));

        const signInProperties = new PersonSignInProperties(userId, UtcDate.now, new NotificationProperties(), UserRole.all);
        await Firestore.shared.person(parameters.id, parameters.personId).set(new Person(parameters.personId, parameters.personProperties, [], signInProperties));

        return user;
    }
}
