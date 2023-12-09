const letterI = [
  '██████ ',
  '  ██   ',
  '  ██   ',
  '  ██   ',
  '██████ ',
]

const letterS = [
  ' █████ ',
  '█      ',
  ' █████ ',
  '      █',
  ' █████ ',
]

const letterD = [
  '██████ ',
  '██   ██',
  '██   ██',
  '██   ██',
  '██████ ',
]

const letterE = [
  '███████',
  '██     ',
  '█████  ',
  '██     ',
  '███████',
]

const letterV = [
  '█     █',
  '██   ██',
  ' ██ ██ ',
  '  ███  ',
  '   █   ',
]

const letter3 = [
  '██████ ',
  '     ██',
  '██████ ',
  '     ██',
  '██████ ',
]

const lettere = [
  '    ',
  '    ',
  '███ ',
  '██  ',
  '███ ',
]

const lettert = [
  '    ',
  '    ',
  '███ ',
  ' █  ',
  ' █  ',
]

const letterh = [
  '    ',
  '    ',
  '█ █ ',
  '███ ',
  '█ █ ',
]

const letter_ = [
  '    ',
  '    ',
  '    ',
  '    ',
  ' █  ',
]

const combineLetters = (...lines) => lines.join(' ')

const colors = {
  reset: "\x1b[0m",
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  magenta: "\x1b[35m",
  cyan: "\x1b[36m",
  white: "\x1b[37m",
  lightgreen: "\x1b[92m", 
  orange: "\x1b[33m", 
  skyblue: "\x1b[96m",
};


// Function to print colored text
const print = (text, color) => {
  console.log(`${colors[color]}${text}${colors.reset}`)
};

export default {
  letterI,
  letterS,
  letterD,
  letterE,
  letterV,
  letter3,
  letter_,
  lettere,
  lettert,
  letterh,
  combineLetters,
  colors,
  print
}


