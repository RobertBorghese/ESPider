/*:
 * @command Condition
 * @text Options for condition.
 * @desc
 *
 * @arg Is Variable Cond
 * @desc Is using variable condition
 * @type boolean
 * @default true
 *
 * @arg Variable Cond
 * @desc The variable id
 * @type number
 * @default 0
 *
 * @arg Variable Comparison
 * @desc The comparison value
 * @type number
 * @default 0
 *
 * @arg Variable Bit Bool
 * @desc The bit compare (a&b === 0 )if true, (a>=b) if false
 * @type boolean
 * @default false
 *
 * @arg Is Opposite
 * @desc If true, the condition will reverse
 * @type boolean
 * @default false
 *
 *
 * @command Layering
 * @text Options for layering.
 * @desc
 *
 * @arg Force Above Ground
 * @desc If true, will always be above the ground it stands on.
 * @type boolean
 * @default false
 * 
 * 
 * @command Specific Position
 * @text Options for positioning.
 * @desc
 *
 * @arg Specific X
 * @desc The specific x the object will spawn at.
 * @type number
 * @default 0
 *
 * @arg Specific Y
 * @desc The specific y the object will spawn at.
 * @type number
 * @default 0
 *
 *
 *
 * @command Specific Tile Position
 * @text Options for tile positioning.
 * @desc
 *
 * @arg Specific Tile X
 * @desc The specific x the object will spawn at.
 * @type number
 * @default 0
 *
 * @arg Specific Tile Y
 * @desc The specific y the object will spawn at.
 * @type number
 * @default 0
 * 
 *
 *
 * @command Specific Position Offset
 * @text Options for positioning offset.
 * @desc
 *
 * @arg Specific Offset X
 * @min -9999
 * @desc The specific x the object will offset.
 * @type number
 * @default 0
 *
 * @arg Specific Offset Y
 * @min -9999
 * @desc The specific y the object will offset.
 * @type number
 * @default 0
 * 
 *
 * 
 * @command Specific Force Below
 * @text Options for force below positioning.
 * @desc
 *
 * @arg Force Below
 * @desc Forces entitiy at literal position.
 * @type boolean
 * @default true
 *
 * @command Do Not Show On Transition
 * @text Options for not showing on transision.
 * @desc
 *
 * @arg Do Not Show On Transition
 * @desc
 * @type boolean
 * @default true
 */