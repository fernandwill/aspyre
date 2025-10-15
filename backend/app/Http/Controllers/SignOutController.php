<?php

namespace App\Http\Controllers;

use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Log;
use Symfony\Component\Process\Process;
use Throwable;

class SignOutController extends Controller
{
    /**
     * Terminate the running application processes when signing out.
     */
    public function __invoke(): JsonResponse
    {
        $this->terminateServer();

        return response()->json([
            'message' => 'Application is shutting down.',
        ]);
    }

    /**
     * Attempt to gracefully stop the PHP development server so the supervisor
     * process can tear down the remaining services (e.g. Vite, queues).
     */
    private function terminateServer(): void
    {
        $signal = \defined('SIGTERM') ? \SIGTERM : 15;

        if (\function_exists('posix_getpid') && \function_exists('posix_kill')) {
            $pid = \posix_getpid();

            \register_shutdown_function(static function () use ($pid, $signal): void {
                @\posix_kill($pid, $signal);
            });

            return;
        }

        // Fall back to shelling out if POSIX functions are unavailable.
        try {
            $process = Process::fromShellCommandline('pkill -f "artisan serve"');
            $process->run();

            // Exit code 1 simply indicates no matching process, which is fine.
            if (!$process->isSuccessful() && $process->getExitCode() > 1) {
                Log::warning('Sign out fallback shutdown command failed.', [
                    'exit_code' => $process->getExitCode(),
                    'error_output' => $process->getErrorOutput(),
                ]);
            }
        } catch (Throwable $exception) {
            Log::warning('Unable to execute sign out shutdown command.', [
                'exception' => $exception->getMessage(),
            ]);
        }
    }
}
