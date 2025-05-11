import { Fine, FineTemplate, Person, Team } from '@stevenkellner/team-conduct-api'

export type TestTeam = {
    id: Team.Id
    name: string,
    persons: Person[],
    fineTemplates: FineTemplate[]
    fines: Fine[]
}
