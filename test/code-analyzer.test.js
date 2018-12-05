import assert from 'assert';
import {ast_handler, parseCode, node_to_string} from '../src/js/code-analyzer';

describe('The javascript parser', () => {
    it('is parsing an let expressions and assignment expressions correctly', () => {
        assert.deepEqual(
            ast_handler(parseCode('let a = 0,b;\nb=a;')), [{'line': 1, 'type': 'VariableDeclaration', 'name': 'a', 'cond': null, 'val': '0'},
                {'line': 1, 'type': 'VariableDeclaration', 'name': 'b', 'cond': null, 'val': null},
                {'line': 2, 'type': 'AssignmentExpression', 'name': 'b', 'cond': null, 'val': 'a'}]);
    });
    it('is parsing loops, conditions and return correctly', () => {
        assert.deepEqual(
            ast_handler(parseCode('function test (y) {\nlet x = 0;\nfor (i = 0; i<10; i=i++) {\n' +
                'if (i%2==0) {\n x=x+y;\n}\nelse if (i%5==0)\nwhile (x>=0) {\nx=x-y;\n}\nelse x=x*y;\n}\nreturn x;\n}')),
            [{line: 1, type: 'FunctionDeclaration', name: 'test', cond: null, val: null}, {line: 1, type: 'VariableDeclaration', name: 'y', cond: null, val: null},
                {line: 2, type: 'VariableDeclaration', name: 'x', cond: null, val: '0'}, {line: 3, type: 'ForStatement', name: null, cond: 'i < 10', val: null},
                {line: 3, type: 'AssignmentExpression', name: 'i', cond: null, val: '0'}, {line: 3, type: 'AssignmentExpression', name: 'i', cond: null, val: 'i++'},
                {line: 4, type: 'IfStatement', name: null, cond: 'i % 2 == 0', val: null} , {line: 5, type: 'AssignmentExpression', name: 'x', cond: null, val: 'x + y'} ,
                {line: 7, type: 'ElseIfStatement', name: null, cond: 'i % 5 == 0', val: null}, {line: 8, type: 'WhileStatement', name: null, cond: 'x >= 0', val: null},
                {line: 9, type: 'AssignmentExpression', name: 'x', cond: null, val: 'x - y'} , {line: 11, type: 'AssignmentExpression', name: 'x', cond: null, val: 'x * y'},
                {line: 13, type: 'ReturnStatement', name: null, cond: null, val: 'x'}]);
    });
});

describe('The javascript parser', () => {
    it('is parsing an empty program', () => {
        assert.deepEqual(ast_handler(parseCode('')),[]);});
    it('is parsing infinite loops', () => {
        assert.deepEqual(ast_handler(parseCode('function infinite_loop() {\nlet x = 0;\nwhile (x<=0) {\nx=x-1;\n}\n}')),
            [{line:1, type: 'FunctionDeclaration', name:'infinite_loop', cond:null, val:null},
                {line:2, type: 'VariableDeclaration', name:'x', cond:null, val:'0'},
                {line:3, type: 'WhileStatement', name:null, cond:'x <= 0', val:null},
                {line:4, type: 'AssignmentExpression', name:'x', cond:null, val:'x - 1'}]);
    });
});

describe('The javascript parser', ()=> {
    it('is parsing single if statement', () => {
        assert.deepEqual(ast_handler(parseCode('function test_if(x) { \nif (x<5)\nreturn x;\n}')),
            [{line: 1, type: 'FunctionDeclaration', name: 'test_if', cond: null, val: null},
                {line: 1, type: 'VariableDeclaration', name: 'x', cond: null, val: null},
                {line: 2, type: 'IfStatement', name: null, cond: 'x < 5', val: null},
                {line: 3, type: 'ReturnStatement', name: null, cond: null, val: 'x'}]);
    });
    it('is parsing a simple if and else statements', () => {
        assert.deepEqual(ast_handler(parseCode('function test_if_else(x) {\nif (x<5)\nreturn 5;\nelse\nreturn x;\n}')),
            [{line: 1, type: 'FunctionDeclaration', name: 'test_if_else', cond: null, val: null},
                {line: 1, type: 'VariableDeclaration', name: 'x', cond: null, val: null},
                {line: 2, type: 'IfStatement', name: null, cond: 'x < 5', val: null},
                {line: 3, type: 'ReturnStatement', name: null, cond: null, val: '5'},
                {line: 5, type: 'ReturnStatement', name: null, cond: null, val: 'x'}]);
    });
});

describe('The javascript parser', ()=> {
    it('is parsing an if and else if statement', () => {
        assert.deepEqual(ast_handler(parseCode('function test_if_else_if(x) {\nif (x<5)\nreturn x;\nelse if (x==5)\nreturn 0;}\n')),
            [{line: 1, type: 'FunctionDeclaration', name: 'test_if_else_if', cond: null, val: null},
                {line: 1, type: 'VariableDeclaration', name: 'x', cond: null, val: null},
                {line : 2, type: 'IfStatement', name: null, cond: 'x < 5', val:null},
                {line: 3, type: 'ReturnStatement', name: null, cond: null, val: 'x'},
                {line : 4, type: 'ElseIfStatement', name: null, cond:'x == 5', val:null},
                {line: 5, type: 'ReturnStatement', name: null, cond: null, val: '0'},]);
    });
    it('is parsing an if and two else if statements', () => {
        assert.deepEqual(ast_handler(parseCode('if (x<5)\nx;\nelse if (x==5)\n0;\nelse if(x>5)\n1;')),
            [{line : 1, type: 'IfStatement', name: null, cond: 'x < 5', val:null},
                {line : 3, type: 'ElseIfStatement', name: null, cond:'x == 5', val:null},
                {line : 5, type: 'ElseIfStatement', name: null, cond:'x > 5', val:null}]);
    });
});

describe('The javascript parser', ()=> {
    it('is parsing a for statement correctly', ()=>{
        assert.deepEqual(ast_handler(parseCode('for(i=0; i<5; i=i++){\nx=x*2;\n}\n')),
            [{line : 1, type:'ForStatement', name:null, cond:'i < 5', val:null},
                {line:1, type:'AssignmentExpression', name:'i', cond:null, val:'0'},
                {line:1, type:'AssignmentExpression', name:'i', cond:null, val:'i++'},
                {line:2, type:'AssignmentExpression', name:'x', cond:null, val:'x * 2'}]);
    });
    it('is stringifying assignment expression correctly', ()=> {
        assert.deepEqual(node_to_string(Array.from(parseCode('x=(y+3)*2;').body)[0]),'x = (y + 3) * 2;');
    });
});