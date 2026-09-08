export interface SeoRoute {
  readonly pathname: string;
  readonly title: string;
  readonly description: string;
  readonly indexable: true;
}

export const seoRoutes: readonly SeoRoute[] = [
  {
    pathname: '/',
    title: 'Fitment Studio — Atlas GarageOS',
    description: 'Compare tire and wheel geometry with transparent calculations.',
    indexable: true,
  },
];

export const APP_STATE_QUERY_PARAMETER = 'setup';
