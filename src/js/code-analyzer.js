import * as esprima from 'esprima';
import * as escodegen from 'escodegen';

const parseCode = (codeToParse) => {
    return esprima.parseScript(codeToParse);
};

const node_to_string = (node) => node ? escodegen.generate(node) : null;

function Record(line, type, name, cond, val) {
    this.line = line;
    this.type = type;
    this.name = name;
    this.cond = cond;
    this.val = val;
}

let records;

let typeToHandlerMap = {'AssignmentExpression': assignment_expr_handler,
    'FunctionDeclaration' : func_decl_handler, 'VariableDeclaration' : var_decl_handler, 'IfStatement' : if_stmnt_handler,
    'WhileStatement': while_stmnt_handler, 'ForStatement':for_stmnt_handler, 'ReturnStatement' : return_stmnt_handler,
    'BlockStatement' : block_stmnt_handler, 'ExpressionStatement':expr_stmnt_handler, 'UpdateExpression':update_expr_handler};

function ast_handler(ast) {
    records = [];
    Array.from(ast.body).forEach((node) => node_handler(node));
    return records;
}

function node_handler(node) {
    let handler = typeToHandlerMap[node.type];
    handler ? handler(node) : null;
}

function func_decl_handler(node) {
    records.push(new Record(node.loc.start.line, node.type, node.id.name, null, null));
    node.params.forEach(p => records.push(new Record(p.loc.start.line, 'VariableDeclaration', p.name, null, null)));
    node_handler(node.body);
}

function var_decl_handler(node) {
    node.declarations.forEach(decl => records.push(new Record(decl.loc.start.line, 'VariableDeclaration', decl.id.name, null, node_to_string(decl.init))));
}

function expr_stmnt_handler(expr) {
    node_handler(expr.expression);
}

function assignment_expr_handler(node) {
    records.push(new Record(node.loc.start.line, node.type, node_to_string(node.left), null, node_to_string(node.right)));
}

function for_stmnt_handler(node) {
    records.push(new Record(node.loc.start.line, node.type, null, node_to_string(node.test), null));
    node_handler(node.init);
    node_handler(node.test);
    node_handler(node.update);
    node_handler(node.body);
}
function while_stmnt_handler(node) {
    records.push(new Record(node.loc.start.line, node.type, null, node_to_string(node.test), null));
    node_handler(node.body);
}

function if_stmnt_handler(node) {
    records.push(new Record(node.loc.start.line, node.type, null, node_to_string(node.test), null));
    node_handler(node.consequent);
    node.alternate ? node.alternate.type === 'IfStatement' ? else_if_stmnt_handler(node.alternate):
        node_handler(node.alternate) : null;
}

function else_if_stmnt_handler(node) {
    records.push(new Record(node.loc.start.line, 'ElseIfStatement', null, node_to_string(node.test), null));
    node_handler(node.consequent);
    node.alternate ? node.alternate.type === 'IfStatement' ? else_if_stmnt_handler(node.alternate):
        node_handler(node.alternate) : null;
}

function return_stmnt_handler(node) {
    records.push(new Record(node.loc.start.line, node.type, null, null, node_to_string(node.argument)));
}

function block_stmnt_handler(block) {
    block.body.forEach(node => node_handler(node));
}

function update_expr_handler(node) {
    records.push(new Record(node.loc.start.line, node.type, node_to_string(node.argument), null,  node_to_string(node)));
}
export {parseCode, node_to_string};