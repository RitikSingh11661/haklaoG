import { NativeStackScreenProps } from "@react-navigation/native-stack";
export type RootStackParamList = {Home: undefined,Login: undefined,Register: undefined,LocationSelection:undefined,Map:undefined,VideoCall: undefined,Practice:undefined,VoiceCall: undefined,Profile: undefined,LocationPermission: undefined,NearByPeople: undefined,UserProfile:undefined,VerificationPending:undefined};

export type HomeProps = NativeStackScreenProps<RootStackParamList, 'Home'>;
export type Profile = NativeStackScreenProps<RootStackParamList, 'Profile'>;
export type UserProps = { _id: String, name: string, email: string, image?: string, verified: boolean, bio: string, location: Object[], verifiedBy?: string,locationVisibility:String[],locationPermissionRequests:String[] };
export type ProfileProps = { navigation: Profile, route: any }
export type MapScreenProps = {route: any}

export type LocationSelection = NativeStackScreenProps<RootStackParamList, 'LocationSelection'>;
export type decodedType = { 'iat': number, 'userId': string }
export type Region = { latitude: number, longitude: number, latitudeDelta: number, longitudeDelta: number };
export type LocationSelectionProps = { navigation: LocationSelection, route: any }