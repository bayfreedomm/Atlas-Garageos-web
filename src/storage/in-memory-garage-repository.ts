import { createEmptyGarageState, type GarageState } from '../domain/garage';
import type { GarageLoadResult, GarageRepository } from './garage-repository';

export class InMemoryGarageRepository implements GarageRepository {
  private state: GarageState;

  public constructor(initialState: GarageState = createEmptyGarageState()) {
    this.state = initialState;
  }

  public async load(): Promise<GarageLoadResult> {
    return { state: this.state, status: this.state.savedSetups.length === 0 && this.state.vehicles.length === 0 ? 'empty' : 'loaded' };
  }

  public async save(state: GarageState): Promise<void> {
    this.state = state;
  }
}
