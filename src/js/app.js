import $ from 'jquery';
import {parseCode} from './code-analyzer';
import {substitute_program_expr} from './symbolic-substitution';

$(document).ready(function () {
    $('#codeSubmissionButton').click(() => {
        let codeToParse = $('#codePlaceholder').val();
        let parsedCode = parseCode(codeToParse);
        let substituted_code = substitute_program_expr(parsedCode);
        // $('#parsedCode').val(JSON.stringify(substituted_code, null, 2));
        $('#parsedCode').val(substituted_code);
        // $('#parsedCode').val(JSON.stringify(parsedCode.body, null, 2));
    });
});

