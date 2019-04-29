import { UserProfile } from './UserProfile';
import { EditorSelection } from './EditorSelection';
import { Color } from './Color';
export interface ClientState {
    clientId: string;
    sessionId: string;
    userProfile: UserProfile;
    editorSelection?: EditorSelection;
    isController: boolean;
    color: Color;
}
