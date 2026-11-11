<?php

namespace App\Exceptions;

use RuntimeException;
use Throwable;

class RemoteStorageException extends RuntimeException
{
    /**
     * Nama disk / driver (ftp / sftp).
     */
    protected string $driver;

    /**
     * Path file atau folder target yang sedang diproses.
     */
    protected ?string $path;

    public function __construct(string $message, string $driver = 'remote', ?string $path = null, int $code = 0, ?Throwable $previous = null)
    {
        $this->driver = $driver;
        $this->path   = $path;

        $prefix = strtoupper($driver) . ' Storage Error';
        if ($path) {
            $prefix .= " [Path: {$path}]";
        }

        parent::__construct("{$prefix}: {$message}", $code, $previous);
    }

    public function getDriver(): string
    {
        return $this->driver;
    }

    public function getStoragePath(): ?string
    {
        return $this->path;
    }
}
