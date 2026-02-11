export interface Favorite {
    id: number;
    userId: number;
    offerId: number;
    title: string;
    company: string;
    location: string;
}

export interface CreateFavoriteDto {
  userId: number;
  offerId: number;
  title: string;
  company: string;
  location: string;
}
