export type RoleUtilisateur =
  | 'client'
  | 'hote'
  | 'transport'
  | 'restaurant'
  | 'evenement';

export interface UtilisateurApp {
  uid: string;
  nomComplet: string;
  email: string;
  telephone: string;
  photoProfil?: string;
  role: RoleUtilisateur;
  nomEntreprise?: string;
  soldePortefeuille: number;
}

export interface ProfilInscription {
  nomComplet: string;
  email: string;
  telephone: string;
  role: RoleUtilisateur;
  nomEntreprise?: string;
}
