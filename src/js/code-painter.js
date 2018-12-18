import * as escodegen from 'escodegen';
// import * as esprima from 'esprima';
import {Parser} from 'expr-eval';

let param_bindings = {};

let fun_str;

function bind_params(func_decl, input) {
    let func_params = func_decl.params.map((param) => escodegen.generate(param));
    for (let i = 0; i < input.length; i++)
        param_bindings[func_params[i]] = input[i]; // bind number
}

function paint_program(program, input) {
    fun_str = escodegen.generate(program);
    paint_func_decl(program.body[0], input);
    let split_painted_string = fun_str.split('\n');
    fun_str = '<pre>';
    split_painted_string.forEach((str)=> fun_str+=paint_line(str) + '<br>');
    fun_str+='</pre>';
    return fun_str;
}

const paint_line = line => line.includes('<mark style="background-color:green">') ? '<mark style="background-color:green">'
    + line.replace('<mark style="background-color:green">','').replace('</mark>','') + '</mark>' :
    line.includes('<mark style="background-color:red">') ? '<mark style="background-color:red">'
        + line.replace('<mark style="background-color:red">','').replace('</mark>','') + '</mark>' : line;

const paint = code => paint_func_map[code.type] ? paint_func_map[code.type](code) : code;

function paint_func_decl(func_decl, input) {
    bind_params(func_decl, input);
    paint(func_decl.body);
}

function paint_if_stmt(if_expr) {
    let parsed_test = Parser.parse(escodegen.generate(if_expr.test));
    let eval_test = parsed_test.evaluate(param_bindings);
    fun_str = eval_test ? fun_str.replace('('+escodegen.generate(if_expr.test)+')', '(<mark style="background-color:green">' + escodegen.generate(if_expr.test) + '</mark>)'):
        fun_str.replace('('+escodegen.generate(if_expr.test)+')', '(<mark style="background-color:red">' + escodegen.generate(if_expr.test) + '</mark>)');
    paint(if_expr.consequent);
    paint(if_expr.alternate);
}

const paint_block_stmt = block_stmt => block_stmt.body.forEach((e) => paint(e));

const paint_while_stmt = code => code.body = paint(code.body);

let paint_func_map = {
    'BlockStatement': paint_block_stmt,
    'IfStatement': paint_if_stmt,
    'WhileStatement': paint_while_stmt,
    'FunctionDeclaration': paint_func_decl,
};

export {paint_program};
