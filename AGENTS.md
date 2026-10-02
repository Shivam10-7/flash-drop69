<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

- Drops are read/written only via server functions using the admin client (no public table/bucket policies), so PINs can't be listed or scraped; files go to a private bucket via signed upload/download URLs.
- Expired drops are purged lazily on every create/read (and rejected if past expires_at), so the 24h rule holds without a cron job.
