export interface Application {
    id: number;
    userId: number;
    offerId: string;
    title: string;
    company: string;
    location: string;
    url: string;
    status: 'pending' | 'accepted' | 'rejected';
    notes: string;
    dateAdded: string;
}

export interface CreateApplicationDto {
    userId: number;
    offerId: string;
    title: string;
    company: string;
    location: string;
    url: string;
    status: 'pending';
    notes: string;
    dateAdded: string;
}
