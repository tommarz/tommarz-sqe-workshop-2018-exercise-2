import * as escodegen from 'escodegen';

let func_params = [];

function add_binding(scope, name, value) {
    scope.bindings[name] = value;
}

function Scope(bindings) {
    this.bindings = bindings;
}

function copy_map(map) {
    let newMap = {};
    for (let i in map)
        newMap[i] = map[i];
    return newMap;
}

function substitute_program_expr(program) {
    program.body = substitute_func_expr(program.body);
    // return program;
    return escodegen.generate(program);
}

function substitute_func_decl(func) {
    func.body = substitute(func.body, new Scope({}));
    return func;
}

function substitute_func_expr(func_expr) {
    func_params = func_expr[0].params.map((param) => escodegen.generate(param));
    func_expr.body = substitute(func_expr[0].body, new Scope({}));
    func_expr.body = remove_decl_and_assignment(func_expr.body);
    // console.log(escodegen.generate(func_expr));
    return func_expr;
}

function remove_decl_and_assignment(code) {
    if (code === null) return null;
    else if (code.type !== 'BlockStatement') {
        if (code.type === 'IfStatement') {
            code.consequent = remove_decl_and_assignment(code.consequent);
            code.alternate = remove_decl_and_assignment(code.alternate);
        } else if (code.type === 'WhileStatement') {
            code.body = remove_decl_and_assignment(code.body);
        }
    } else {
        code.body = code.body.filter((e) => e.type !== 'VariableDeclaration' && (e.type !== 'ExpressionStatement' ||
            e.expression.type !== 'AssignmentExpression')).map((e) => remove_decl_and_assignment(e));
    }
    return code;
}

const is_func_param = (identifier) => func_params.includes(escodegen.generate(identifier));

function substitute(e, scope) {
    return e.type === 'Literal' ? e : sub_func_map[e.type] ? sub_func_map[e.type](e, scope) : e;
}

function substitute_expr_stmt(expr_stmt, scope) {
    expr_stmt.expression = substitute(expr_stmt.expression, scope);
    return expr_stmt;
}

function substitute_block_stmt(stmt, scope) {
    let innerScope = new Scope(scope.bindings);
    stmt.body.forEach((e) => {
        let result = substitute(e, innerScope);
        e = result;
        return e;
    });
    return stmt;
}

function substitute_while_stmt(while_stmt, scope) {
    let innerScope = new Scope(scope.bindings);
    while_stmt.test = substitute(while_stmt.test, innerScope);
    while_stmt.body = substitute(while_stmt.body, innerScope);
    return while_stmt;
}

function substitute_if_stmt(if_stmt, scope) {
    let innerScope = new Scope(copy_map(scope.bindings));
    if_stmt.test = substitute(if_stmt.test, innerScope);
    if_stmt.consequent = substitute(if_stmt.consequent, new Scope(copy_map(innerScope.bindings)));
    if_stmt.alternate = substitute(if_stmt.alternate, new Scope(copy_map(innerScope.bindings)));
    return if_stmt;
}

function substitute_assignment_expr(expr, scope) {
    expr.right = substitute(expr.right, scope);
    add_binding(scope, escodegen.generate(expr.left), expr.right);
    return expr;
}

function substitute_decl_expr(expr, scope) {
    expr.declarations.map((decl) => add_binding(scope, escodegen.generate(decl.id), substitute(decl.init, scope)));
    return null;
}

function substitute_ret_stmt(stmt, scope) {
    stmt.argument = substitute(stmt.argument, scope);
    return stmt;
}

function substitute_bin_expr(bin_expr, scope) {
    bin_expr.left = substitute(bin_expr.left, scope);
    bin_expr.right = substitute(bin_expr.right, scope);
    return escodegen.generate(bin_expr.left) === '0' ? bin_expr.right : escodegen.generate(bin_expr.right) === '0' ?
        bin_expr.left : bin_expr;
    // return esprima.BinaryExpression()(bin_expr.operator, substitute(bin_expr.left, Scope), substitute(bin_expr.right, Scope));
}

// new esprima.BinaryExpression(bin_expr, bin_expr.left, bin_expr.right);
// .BinaryExpression(bin_expr.operator, substitute(bin_expr.left, Scope), substitute(bin_expr.right, Scope));

const substitute_identifier = (identifier, scope) => (is_func_param(identifier) ? identifier : substitute(scope.bindings[escodegen.generate(identifier)], scope));


let sub_func_map = {
    'BlockStatement': substitute_block_stmt,
    'VariableDeclaration': substitute_decl_expr,
    'AssignmentExpression': substitute_assignment_expr,
    'WhileStatement': substitute_while_stmt,
    'IfStatement': substitute_if_stmt,
    'BinaryExpression': substitute_bin_expr,
    'Identifier': substitute_identifier,
    'ReturnStatement': substitute_ret_stmt,
    'ExpressionStatement': substitute_expr_stmt,
    'FunctionDeclaration': substitute_func_decl
};

export {substitute_program_expr};