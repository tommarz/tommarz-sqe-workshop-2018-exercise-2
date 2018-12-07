import * as escodegen from 'escodegen';
import * as esprima from 'esprima';

let param_bindings = {};

function bind_params(func_decl, input) {
    let func_params = func_decl.params.map((param) => escodegen.generate(param));
    for (let i = 0; i < input.length; i++)
        param_bindings[func_params[i]] = esprima.parse(input[i]).body[0].expression;
}

function paint_program(program, input) {
    let func_decl = program.body[0];
    program.body[0] = paint_func_decl(func_decl, input);
    return escodegen.generate(program);
}

function paint_func_decl(func_decl, input) {
    bind_params(func_decl, input);
    func_decl.body = substitute_params(func_decl.body);
    return func_decl;
}

const substitute_params = (code) => sub_param_func_map[code.type] ? sub_param_func_map[code.type](code) : code;

function sub_param_block_stmt (block_stmt) {
    block_stmt.body = block_stmt.body.map((e) => substitute_params(e));
    return block_stmt;
}

function sub_param_if_stmt(if_stmt) {
    if_stmt.test = substitute_params(if_stmt.test);
    if_stmt.consequent = substitute_params(if_stmt.consequent);
    if_stmt.alternate = substitute_params(if_stmt.alternate);
    return if_stmt;
}

function sub_param_while_stmt_func_decl(code) {
    code.body = substitute_params(code.body);
    return code;
}

const sub_param_identifier = (identifier) => param_bindings[identifier.name];

function sub_param_bin_expr(bin_expr) {
    bin_expr.left = substitute_params(bin_expr.left);
    bin_expr.right = substitute_params(bin_expr.right);
    return bin_expr;
}

function sub_param_ret_stmt(ret_stmt) {
    ret_stmt.argument = substitute_params(ret_stmt.argument);
    return ret_stmt;
}

let sub_param_func_map = {
    'BlockStatement' : sub_param_block_stmt,
    'IfStatement' : sub_param_if_stmt,
    'WhileStatement': sub_param_while_stmt_func_decl,
    'FunctionDeclaration' : sub_param_while_stmt_func_decl,
    'Identifier': sub_param_identifier,
    'BinaryExpression': sub_param_bin_expr,
    'ReturnStatement': sub_param_ret_stmt
};

export {paint_program};