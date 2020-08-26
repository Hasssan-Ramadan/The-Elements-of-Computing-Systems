// This file is part of www.nand2tetris.org
// and the book "The Elements of Computing Systems"
// by Nisan and Schocken, MIT Press.
// File name: projects/04/Mult.asm

// Multiplies R0 and R1 and stores the result in R2.
// (R0, R1, R2 refer to RAM[0], RAM[1], and RAM[2], respectively.)

// Put your code here.
// val = R0
@R0
D=M
@val
M=D

// sum = 0
@sum
M=0

// count = R1
@R1
D=M
@count
M=D

(LOOP)
// if (count < 0) goto END
@count
D=M
@END
D;JLE

// sum += val
@val
D=M
@sum
M=M+D

// count -= 1
@count
M=M-1
@LOOP
0;JMP

(END)
// R2 = sum
@sum
D=M
@R2
M=D
