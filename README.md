# VRCDN Basic Diagnostic Tool
This is a basic diagnostic tool for VRCDN. It runs some basic network tests on a user's system and returns a PASS or FAIL.

 This has been in the works for a while but [@SticksDev](https://github.com/SticksDev) releasing their tool gave me a kick to finish and release this one.

 > [!NOTE] 
 > As always, this isn't a definitive sign of zero issues if all tests pass, however if a test fails then issues are likely.

### Installation
There are compiled versions of this tool available under the releases.

### Usage
To run the diagnostic tool, use the following command:
```cmd
VRCDN-Network-Diagnostics.exe
```

You can also use the following options:
```
-a, --auto-submit: Automatically submit the log to VRCDN (Policies apply)
-h, --help: Show the help message
```

### Log submission
Log submission is optional, either close the app when asked or enter `N` or `n` no answer is considerd to be a yes.

These submissions are pushed into a system, that I dub `NetClarity`, that we hope is going to provide us with more insight into how connections to VRCDN are currently being routed and where issues lie.
We already feed our own data into this system however these are currently `datacenter -> datacenter` when the actual data we need is `Residential/User -> datacenter`.

### Contributing
Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

### License
This project is licensed under the MIT License. See the LICENSE file for details.
