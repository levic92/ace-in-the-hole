/**
 * @providesModule Assets
 */

import Exponent from 'exponent';

// We will refer to assets by a 'friendly name' such as 'splash-sound' or
// 'player-sprite', offering an additional level of indirection over the
// actual file paths.

// Map of asset names to modules. List your assets here.
const modules = {
  // 'dog-dead-1': require('./dog-dead-1.png'),
  'dog-jump': require('./sheets/dog-jump-2.png'),
  'dead-dog': require('./sheets/dead-dog.png'),

  // dirt
  'dirt': require('./sprites/dirt.png'),
  'dirt-left': require('./sprites/dirt-left.png'),
  'dirt-right': require('./sprites/dirt-right.png'),

  // platform
  'platform-middle': require('./sprites/platform/platform-middle.png'),
  'platform-left': require('./sprites/platform/platform-left.png'),
  'platform-right': require('./sprites/platform/platform-right.png'),
}

// Export map of asset names to `Exponent.Asset` objects.
export default Object.assign({}, ...Object.keys(modules).map((name) =>
  ({ [name]: Exponent.Asset.fromModule(modules[name]) })));
