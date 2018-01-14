import { testingUrl, Scenario } from '../testingEngine';

new Scenario({
  name: 'test1',
  steps: [
    {
      title: 'step1',
      url: `${testingUrl}/1`
    },
    {
      title: 'step1',
      url: `${testingUrl}/2`
    }
  ]
}).play();
