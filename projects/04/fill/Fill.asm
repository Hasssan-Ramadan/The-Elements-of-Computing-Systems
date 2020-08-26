// This file is part of www.nand2tetris.org
// and the book "The Elements of Computing Systems"
// by Nisan and Schocken, MIT Press.
// File name: projects/04/Fill.asm

// Runs an infinite loop that listens to the keyboard input.
// When a key is pressed (any key), the program blackens the screen,
// i.e. writes "black" in every pixel;
// the screen should remain fully black as long as the key is pressed. 
// When no key is pressed, the program clears the screen, i.e. writes
// "white" in every pixel;
// the screen should remain fully clear as long as no key is pressed.

// Put your code here.
(LOOP)
// ----- decide black or white
@val
M=0
@KBD
D=M
@DECIDEEND
D;JEQ
@val
M=-1
(DECIDEEND)
// decide black or white -----

// current = 16384 screen (0,0)
@SCREEN
D=A
@current
M=D

// count = 8192 screen size
@8192
D=A
@count
M=D

// ----- fill screen
(FILL)
// load val
@val
D=M

// Addr[current] = val
@current
A=M
M=D

// current += 1
@current
D=M+1
@current
M=D

// check FILL loop
@count
M=M-1
D=M
@FILL
D;JGT
// fill screen -----

// goto LOOP infinitely
@LOOP
0;JMP