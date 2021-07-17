import { getSigns } from '../lib/db/signs';

function Signs() {
  return <div>
    <h1>Signs</h1>
    <pre>{JSON.stringify(getSigns(), null, 2)}</pre>
  </div>
}

export default Signs;