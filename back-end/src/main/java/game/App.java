package game;

import java.io.IOException;
import java.util.Map;
import fi.iki.elonen.NanoHTTPD;

public class App extends NanoHTTPD {
    private Game game;

    public static void main(String[] args) {
        try {
            new App();
        } catch (IOException ioe) {
            System.err.println("Couldn't start server:\n" + ioe);
        }
    }

    public App() throws IOException {
        super(8080);
        this.game = new Game();
        start(NanoHTTPD.SOCKET_READ_TIMEOUT, false);
        System.out.println("\nRunning!\n");
    }

    @Override
    public Response serve(IHTTPSession session) {
        String uri = session.getUri();
        Map<String, String> params = session.getParms();

        if (uri.equals("/newgame")) {
            String starter = params.get("starter");
            Player startingPlayer = "O".equalsIgnoreCase(starter) ? Player.PLAYER1 : Player.PLAYER0;
            this.game = new Game(new Board(), startingPlayer);
        } else if (uri.equals("/play")) {
            int x = Integer.parseInt(params.get("x"));
            int y = Integer.parseInt(params.get("y"));
            this.game = this.game.play(x, y);
        }

        GameState gameplay = GameState.forGame(this.game);
        return newFixedLengthResponse(gameplay.toString());
    }
}
