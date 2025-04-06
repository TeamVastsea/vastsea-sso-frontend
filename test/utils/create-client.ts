import { CreateClient } from '../../src/client/dto/create-client';
import { ClientService } from '../../src/client/client.service';

export const createClient = (data: CreateClient, service: ClientService) => {
  return service.createClient(data);
};
