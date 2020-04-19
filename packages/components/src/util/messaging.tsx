import React from 'react';

export function getActionErrorMessage(
    problemStatement: string,
    noun: string,
    showRefresh: boolean = true
): React.ReactNode {
    return (
        <span>
            {problemStatement}
            &nbsp;Your session may have expired or the {noun} may no longer be valid.
            {showRefresh && (
                <>
                    &nbsp;Try <a onClick={() => window.location.reload()}>refreshing the page</a>.
                </>
            )}
        </span>
    );
}

export function resolveErrorMessage(error: any, noun: string = undefined, nounPlural?: string, verb?: string): string {
    let errorMsg;
    if (!error) {
        return undefined;
    }
    if (typeof error === 'string') {
        errorMsg = error;
    } else if (error.message) {
        errorMsg = error.message;
    } else if (error.msg) {
        errorMsg = error.msg;
    } else if (error.exception) {
        errorMsg = error.exception;
    }
    if (errorMsg) {
        const lcMessage = errorMsg.toLowerCase();
        if (
            lcMessage.indexOf('violates unique constraint') >= 0 ||
            lcMessage.indexOf('violation of unique key constraint') >= 0
        )
            return 'There was a problem ' + (verb || 'creating') + ' your ' + noun + '.  Check the existing ' + (nounPlural || noun) + ' for possible duplicates and make sure any referenced ' + (nounPlural || noun) + ' are still valid.';
        else if (lcMessage.indexOf('existing row was not found') >= 0) {
            return (
                'We could not find the ' +
                noun +
                (verb ? ' to ' + verb : '') +
                '.  Try refreshing your page to see if it has been deleted.'
            );
        } else if (
            lcMessage.indexOf('communication failure') >= 0 ||
            lcMessage.match(/query.*in schema.*doesn't exist/) !== null ||
            lcMessage.match(/query.*in schema.*does not exist/) !== null
        ) {
            return 'There was a problem retrieving your ' + (noun || 'data') + '. Your session may have expired or the ' + (noun || 'data') + ' may no longer be valid.  Try refreshing your page.';
        } else if (lcMessage.indexOf('either rowid or lsid is required') >= 0) {
            return 'There was a problem retrieving or updating your ' + (noun || 'data') + '.  The request did not contain the proper identifiers.  Make sure the ' + (noun || 'data') + ' are still valid.';
        }
    }
    return errorMsg;
}
