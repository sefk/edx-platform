(function (requirejs, require, define, undefined) {

require(
['video/00_process.js'],
function (Process) {
    var getArrayNthLength = function (n, multiplier) {
            var result = [],
                mul = multiplier || 1;

            for (var i = 0; i < n; i++) {
                result[i] = i * mul;
            }

            return result;
        },
        items = getArrayNthLength(1000);

    describe('Process', function () {
        it ('Array is processed successfully', function () {
            var processedArray,
                expectedArray = getArrayNthLength(1000, 2),
                process = function (item) {
                    return 2 * item;
                };

            runs(function () {
                Process.array(items, process).done(function (result) {
                    processedArray = result;
                });
            });

            waitsFor(function () {
                return processedArray;
            }, 'Array processing takes too much time', WAIT_TIMEOUT);

            runs(function () {
                expect(processedArray).toEqual(expectedArray);
            });
        });

        it ('If non-array is passed, error callback is called', function () {
            var isError,
                process = function () {};

            runs(function () {
                Process.array('string', process).fail(function () {
                    isError = true;
                });
            });

            waitsFor(function () {
                return isError;
            }, 'Error callback wasn\'t called', WAIT_TIMEOUT);

            runs(function () {
                expect(isError).toBeTruthy();
            });
        });

        it ('If an empty array is passed, returns initial array', function () {
            var processedArray,
                process = function () {};

            runs(function () {
                Process.array([], process).done(function (result) {
                    processedArray = result;
                });
            });

            waitsFor(function () {
                return processedArray;
            }, 'Array processing takes too much time', WAIT_TIMEOUT);

            runs(function () {
                expect(processedArray).toEqual([]);
            });
        });

        it ('If no process function passed, returns initial array', function () {
            var processedArray;

            runs(function () {
                Process.array(items).done(function (result) {
                    processedArray = result;
                });
            });

            waitsFor(function () {
                return processedArray;
            }, 'Array processing takes too much time', WAIT_TIMEOUT);

            runs(function () {
                expect(processedArray).toEqual(items);
            });
        });
    });
});


}(RequireJS.requirejs, RequireJS.require, RequireJS.define));
