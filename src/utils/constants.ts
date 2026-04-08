import { TaskStatus, Priority, type WarPhase } from '../types'

export const SCHEMA_VERSION = 2

export const STORAGE_KEY = 'war-with-chaos-state'

export const COLUMN_CONFIG: { status: TaskStatus; label: string; subLabel: string }[] = [
  { status: TaskStatus.Backlog,    label: 'Backlog',     subLabel: 'Chaos stirs here' },
  { status: TaskStatus.InProgress, label: 'In Progress', subLabel: 'The front holds' },
  { status: TaskStatus.Done,       label: 'Done',        subLabel: 'Glory to Sigmar' },
]

export const PRIORITY_CONFIG: Record<Priority, { label: string; thematicLabel: string; color: string; border: string; icon: string }> = {
  [Priority.Low]:    { label: 'Low',    thematicLabel: 'Skirmish',  icon: '⚔',  color: 'text-text-secondary', border: 'border-text-secondary/40' },
  [Priority.Medium]: { label: 'Medium', thematicLabel: 'Campaign',  icon: '⚔⚔', color: 'text-order-gold',     border: 'border-order-gold/50' },
  [Priority.High]:   { label: 'High',   thematicLabel: 'Crusade',   icon: '💀', color: 'text-chaos-red',      border: 'border-chaos-red/60' },
}

export const FLAVOR_TEXTS: Record<WarPhase, string[]> = {
  neutral: [
    'Before the first battle, all is quiet in the Old World.',
    'No tasks, no war. The Empire and the Dark Gods watch each other across the Rhine.',
    'Add your first task. Let the war begin.',
    'The Chaos Wastes are silent. For now.',
    'The great cannon sits unloaded. The war has not yet begun.',
    'Dust settles on the barracks floor. The Empire awaits its orders.',
  ],
  balanced: [
    'The battle lines hold. Neither side gains ground this day.',
    'The Empire musters its legions. The Dark Gods whisper promises.',
    'Swords clash in the mud between the trenches. The outcome is unwritten.',
    'Warriors of both sides rest. A fragile equilibrium persists.',
    'Powder smoke hangs over no man\'s land. The cannon crews wait.',
    'The augurs read the entrails and find no clear omen.',
    'Neither faith nor corruption prevails. The scales of fate are level.',
    'Every completed order brings the Empire closer to triumph.',
    'For every task completed, a daemon is weakened. Do not relent.',
    'The Chaos Gods grow restless. Your hesitation is their sustenance.',
  ],
  order_winning: [
    'The Imperial banner advances. Sigmar\'s light burns through the corruption.',
    'The Chaos tide recedes. Warrior Priests sing hymns of victory.',
    'For every task laid to rest, a daemon is banished back to the Realm of Chaos.',
    'The Empire pushes forward. Cannon fire echoes across the plains.',
    'Knightly orders ride in pursuit of the fleeing warband.',
    'The comet of Sigmar blazes overhead. Fortune favours the diligent.',
    'The generals speak of a rout. Hold the line and press your advantage.',
    'Runepriests inscribe names of the fallen onto the Temple walls.',
    'The tide turns. What was lost may yet be reclaimed.',
    'Halberdiers advance in lockstep. The wall of steel moves forward.',
    'Reports from the front: enemy resistance is crumbling.',
    'The Grand Theogonist blesses the cannons. Fire at will.',
  ],
  chaos_winning: [
    'The Dark Powers stir. Corruption spreads from the north.',
    'The mutants multiply. The Empire\'s lines are stretched thin.',
    'Warriors of Chaos sharpen their blades. Your backlog grows heavy as iron.',
    'The Eye of Chaos watches. It is pleased with your delay.',
    'Marauders breach the outer walls. The garrison is overwhelmed.',
    'Plagued cattle are found in the fields. Nurgle\'s gifts are spreading.',
    'A Chaos sorcerer binds your will with enchantment. Resist. Act.',
    'The screaming of the damned fills the night. Too many tasks left undone.',
    'The eight-pointed star is seen carved into the barracks door.',
    'Beastmen raid the supply lines. Momentum is lost.',
    'The priests pray but Sigmar\'s gaze seems distant tonight.',
    'Your backlog is the army of darkness. It must be routed.',
  ],
  order_victory: [
    'THE EMPIRE STANDS VICTORIOUS. Chaos is driven back beyond the mountains.',
    'Sigmar\'s hammer has struck true. All tasks are complete — glory to the Empire!',
    'The corruption fades. Clear skies reign over the Empire\'s fertile lands.',
    'The Chaos host is broken. The generals raise their swords in triumph.',
    'Songs will be sung in Altdorf of this great victory.',
  ],
  chaos_victory: [
    'CHAOS REIGNS ETERNAL. The Empire is ash. All is lost.',
    'The Eye of Chaos opens wide. There is no hope left in the mortal realm.',
    'The gods of disorder feast upon your incompletion. The world burns.',
    'The walls of Altdorf crumble. The Chaos tide is unstoppable now.',
    'Archaon\'s hordes have taken the final keep. Submit to the darkness.',
  ],
}

export interface Achievement {
  id: string
  threshold: number
  title: string
  description: string
}

export const ACHIEVEMENTS: Achievement[] = [
  { id: 'first-blood',    threshold: 1,   title: 'First Blood',             description: 'Your first enemy has been slain. The war has begun.' },
  { id: 'skirmisher',     threshold: 5,   title: 'Skirmisher',              description: 'Five victories. You are no longer a recruit.' },
  { id: 'veteran',        threshold: 10,  title: 'Veteran of Middenheim',   description: 'Ten victories. The Old World knows your name.' },
  { id: 'knight',         threshold: 25,  title: 'Knight of the Realm',     description: 'Twenty-five victories. A banner flies in your honour.' },
  { id: 'champion',       threshold: 50,  title: 'Champion of Sigmar',      description: 'Fifty victories. Sigmar himself has taken notice.' },
  { id: 'ghal-maraz',     threshold: 100, title: 'Ghal Maraz Bearer',       description: 'One hundred victories. The Empire endures because of you.' },
  { id: 'iron-general',   threshold: 250, title: 'Iron General',            description: 'Two hundred and fifty. Chaos retreats at the sound of your name.' },
  { id: 'chosen-of-sigmar', threshold: 500, title: 'Chosen of Sigmar',     description: 'Five hundred. The gods of Order bow their heads in recognition.' },
]

export const STREAK_TITLES: { days: number; title: string }[] = [
  { days: 3,  title: 'Three-Day Campaigner' },
  { days: 7,  title: 'Veteran of Seven Campaigns' },
  { days: 14, title: 'Fortnight on the Front' },
  { days: 30, title: 'Month-Long Crusader' },
  { days: 100, title: 'Century of Service' },
]

export const CHAOS_GOD_MARKS: { days: number; god: string; icon: string; color: string; flavor: string }[] = [
  { days: 3,  god: 'Tzeentch',  icon: '🌀', color: 'text-chaos-purple', flavor: 'The Architect of Fate schemes around this task.' },
  { days: 7,  god: 'Nurgle',    icon: '☠',  color: 'text-green-600',    flavor: 'Grandfather Nurgle embraces this rotting obligation.' },
  { days: 14, god: 'Slaanesh',  icon: '✦',  color: 'text-pink-400',     flavor: 'Prince of Pleasure distracts you from this task.' },
  { days: 21, god: 'Khorne',    icon: '💢', color: 'text-chaos-red',    flavor: 'Khorne demands blood. This task mocks your inaction.' },
]
