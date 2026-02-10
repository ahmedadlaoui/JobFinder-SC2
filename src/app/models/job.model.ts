export interface UsaJobsResponse {
    SearchResult: {
        SearchResultCount: number;
        SearchResultCountAll: number;
        SearchResultItems: UsaJobsItem[];
    };
}

export interface UsaJobsItem {
    MatchedObjectId: string;
    MatchedObjectDescriptor: {
        PositionTitle: string;
        OrganizationName: string;
        PositionLocationDisplay: string;
        PublicationStartDate: string;
        PositionURI: string;
        ApplyURI: string[];
        QualificationSummary: string;
        PositionRemuneration: {
            MinimumRange: string;
            MaximumRange: string;
            Description: string;
        }[];
        UserArea: {
            Details: {
                JobSummary: string;
            };
        };
    };
}

export interface Job {
    id: string;
    title: string;
    organization: string;
    location: string;
    publicationDate: string;
    positionUri: string;
    applyUri: string;
    salary: string;
    summary: string;
}

export interface JobSearchResponse {
    jobs: Job[];
    totalCount: number;
}