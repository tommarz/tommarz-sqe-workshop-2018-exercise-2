import $ from 'jquery';
import {parseCode} from './code-analyzer';
import {substitute_program_expr} from './symbolic-substitution';
import {paint_program} from './code-painter';

$(document).ready(function () {
    $('#codeSubmissionButton').click(() => {
        let codeToParse = $('#codePlaceholder').val();
        let inputVector = $('#inputVector').val().split(',');
        let parsedCode = parseCode(codeToParse);
        let substituted_code = substitute_program_expr(parsedCode);
        let painted_func = paint_program(parsedCode,inputVector);
        $('#parsedCode').val(substituted_code);
        $('#painedCode').val(painted_func);
    });
});

