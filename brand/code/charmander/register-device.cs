// source: api-dotnet/Program.cs lines 51-57
// https://github.com/SilverNETGroupSGGW/Charmander/blob/63b4bc9373cb150718fb6a351d4aa006368a750e/api-dotnet/Program.cs#L51-L57

app.MapPost("/register-device", async (RegisterDeviceRequest body, IDeviceTokenRepository repository) =>
{
  var total = await repository.RegisterAsync(body.Token);

  Console.WriteLine($"Device registered: {body.Token}");
  return Results.Json(new { registered = body.Token, total }, statusCode: StatusCodes.Status201Created);
})
