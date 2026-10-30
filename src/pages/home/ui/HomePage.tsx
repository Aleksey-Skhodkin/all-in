import { useAuth } from "@app/providers/auth-provider/AuthProvider";
import { Link } from "@tanstack/react-router";

export const HomePage = () => {
  const auth = useAuth();

  return (
    <div className="max-w-[500px] m-auto">
      <h1>{auth.status}</h1>

      <h1>Welcome!</h1>
      <p>
        <strong>IMPORTANT!!!</strong> This is just an example of how to use authenticated routes
        with TanStack Router.
        <br />
        This is NOT an example how you'd write a production-level authentication system.
        <br />
        You'll need to take the concepts and patterns used in this example and adapt then to work
        with your authentication flow/system for your app.
      </p>
      <p>
        You are currently on the index route of the <strong>authenticated-routes</strong> example.
      </p>
      <p>You can try going through these options.</p>
      <ol>
        <li>
          <Link to="/sign-in" className="text-blue-500 hover:opacity-75">
            Go to the public login page.
          </Link>
        </li>
        <li>
          <Link to="/projects" className="text-blue-500 hover:opacity-75">
            Go to the auth-only projects page.
          </Link>
        </li>
        <li>
          <Link to="/posts" className="text-blue-500 hover:opacity-75">
            Go to the auth-only posts page.
          </Link>
        </li>
      </ol>
      {/* <iframe */}
      {/*   className="w-full max-w-[500px] aspect-video" */}
      {/*   src="https://vkvideo.ru/video_ext.php?oid=-219252372&id=456242232&hd=4" */}
      {/*   // width="500" */}
      {/*   // height="360" */}
      {/*   allow="autoplay; encrypted-media; fullscreen; picture-in-picture; screen-wake-lock;" */}
      {/*   // frameborder="0" */}
      {/*   // allowfullscreen */}
      {/* /> */}
    </div>
  );
};
